import json
from collections import defaultdict

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from django.db.models import F, OuterRef, Subquery
from django.utils import timezone

from company.models import Company
from sensor_data.models import AdminUserSensorData, CompanySensorData

from utils.constants import UserType

User = get_user_model()


class SensorDataConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope["user"]
        self.is_superadmin = user.type == UserType.SUPERADMIN

        if not self.is_superadmin:
            self.group_name = await self.get_group_name(user)
            await self.subscribe_to_group(self.group_name)
        else:
            self.subscribed_group = ""

        await self.accept()
        if user.is_associated_with_company and not self.is_superadmin:
            initial_data = await self.send_initial_data(user=None, company=user.company)
            await self.send(text_data=json.dumps(initial_data))
        elif not self.is_superadmin:
            initial_data = await self.send_initial_data(user=user, company=None)
            await self.send(text_data=json.dumps(initial_data))

    async def disconnect(self, close_code):
        await self.unsubscribe_from_group()

    async def send_data(self, event):
        print("inside send_data consumers.py")
        data = event["data"]
        # Send the data to the websocket
        await self.send(text_data=json.dumps(data))
        print("exiting send_data consumers.py")

    async def receive(self, text_data):
        if self.is_superadmin:
            data = json.loads(text_data)
            message_type = data.get("type")

            if message_type == "group_subscribe":
                group_name = data.get("group_name")
                group_type = data.get("group_type")
                user_id = data.get("user_id")
                await self.unsubscribe_from_group()
                await self.subscribe_to_group(group_name)
                initial_data = await self.send_initial_data(
                    group_name=group_name, group_type=group_type, user_id=user_id
                )

                await self.send(text_data=json.dumps(initial_data))

    async def subscribe_to_group(self, group_name):
        await self.channel_layer.group_add(group_name, self.channel_name)
        self.subscribed_group = group_name

    async def unsubscribe_from_group(self):
        if self.subscribed_group:
            await self.channel_layer.group_discard(
                self.subscribed_group, self.channel_name
            )
            self.subscribed_group = ""

    @staticmethod
    @database_sync_to_async
    def get_group_name(user):
        if user.is_associated_with_company:
            return user.company.slug
        else:
            if user.type != UserType.ADMIN:
                # extra database call
                admin_user_id = user.user_extra_field.created_by.id
                return f"admin-user-{admin_user_id}"
            else:
                return f"admin-user-{user.id}"

    @staticmethod
    @database_sync_to_async
    def send_initial_data(
        user=None, company=None, group_name=None, group_type=None, user_id=None
    ):
        if group_name:
            if group_type == "user":
                user = User.objects.select_related("user_extra_field").get(pk=user_id)
            else:
                company = Company.objects.get(slug=group_name)

        if user:
            iot_device_list = []
            if user.type != "ADMIN":
                admin_user = user.user_extra_field.created_by
                iot_device_list = admin_user.iot_device.all()
            else:
                iot_device_list = user.iot_device.all()
            admin_user_sensor_data_qs = AdminUserSensorData.objects.values(
                "user_sensor__sensor__name",
                "iot_device_id",
                "value",
                "timestamp",
            ).filter(
                iot_device__in=iot_device_list,
                timestamp=Subquery(
                    AdminUserSensorData.objects.filter(
                        user_sensor__sensor__name=OuterRef("user_sensor__sensor__name"),
                        iot_device_id=OuterRef("iot_device_id"),
                    )
                    .order_by("-timestamp")
                    .values("timestamp")[:1]
                ),
            )
            sensors_data = defaultdict(list)
            for data in admin_user_sensor_data_qs:
                iot_device_id = data.pop("iot_device_id")
                data["timestamp"] = (
                    data["timestamp"]
                    .astimezone(timezone.get_default_timezone())
                    .strftime("%Y-%m-%d %H:%M:%S")
                )
                sensors_data[iot_device_id].append(data)
            return sensors_data

        elif company:
            iot_device_list = company.iot_device.all()
            company_sensor_data_qs = (
                CompanySensorData.objects.filter(iot_device__in=iot_device_list)
                .values(
                    "company_sensor__sensor__name",
                    "iot_device_id",
                    "value",
                )
                .annotate(
                    latest_timestamp=Subquery(
                        CompanySensorData.objects.filter(
                            company_sensor__sensor__name=OuterRef(
                                "company_sensor__sensor__name"
                            ),
                            iot_device_id=OuterRef("iot_device_id"),
                        )
                        .order_by("-timestamp")
                        .values("timestamp")[:1]
                    ),
                )
                .filter(timestamp=F("latest_timestamp"))
            )

            sensors_data = defaultdict(dict)

            for data in company_sensor_data_qs:
                iot_device_id = data.pop("iot_device_id")
                data["timestamp"] = timezone.localtime(
                    data.pop("latest_timestamp")
                ).strftime("%Y/%m/%d %H:%M:%S")
                sensor_name = data.pop("company_sensor__sensor__name")
                sensor_value = data.pop("value")
                data[sensor_name] = sensor_value
                sensors_data[iot_device_id].update(data)

            return sensors_data
