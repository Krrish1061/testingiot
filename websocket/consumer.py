import json
from collections import defaultdict

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.db.models import F, OuterRef, Subquery
from django.utils import timezone

from iot_devices.cache import IotDeviceCache
from sensor_data.models import SensorData
from users.cache import UserCache
from company.cache import CompanyCache
from utils.commom_functions import get_groups_tuple
from utils.constants import GroupName, UserType
from websocket.cache import ConnectedConsumersCache

User = get_user_model()


class SensorDataConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope["user"]
        if isinstance(user, AnonymousUser):
            await self.close()
        user_groups = get_groups_tuple(user)
        self.is_superadmin = (
            True if GroupName.SUPERADMIN_GROUP in user_groups else False
        )

        if not self.is_superadmin:
            group_name = self.get_group_name(user)
            await self.subscribe_to_group(group_name)
        else:
            self.subscribed_group = ""

        await self.accept()
        if not self.is_superadmin:
            initial_data = await self.send_initial_data(user=user, company=user.company)
            await self.send(text_data=json.dumps(initial_data))

    async def disconnect(self, close_code):
        await self.unsubscribe_from_group()

    async def send_data(self, event):
        # Send the data to the websocket
        device_id = event["device_id"]
        data = event["data"]
        sensor_data = {
            sensor_name: data[field_name]
            for field_name, sensor_name in event["field_sensor_name_dict"].items()
            if field_name in data
        }
        sensor_data["timestamp"] = data["timestamp"]
        await self.send(text_data=json.dumps({device_id: sensor_data}))

    async def receive(self, text_data):
        if self.is_superadmin:
            data = json.loads(text_data)
            message_type = data.get("type")

            if message_type == "group_subscribe":
                company_slug = data.get("company_slug")
                username = data.get("username")
                group_type = data.get("group_type")
                user, company = await self.get_user_or_company(
                    group_type, username=username, company_slug=company_slug
                )
                # here user is the admin user
                group_name = user.username if user else company.slug
                await self.unsubscribe_from_group()
                await self.subscribe_to_group(group_name)
                initial_data = await self.send_initial_data(user=user, company=company)

                await self.send(text_data=json.dumps(initial_data))
        else:
            # no is allowed to send data so close the connection if such data is received
            await self.close()

    async def subscribe_to_group(self, group_name):
        await self.channel_layer.group_add(group_name, self.channel_name)
        self.subscribed_group = group_name
        # await self.connected_consumers(group_name, actions="connect")

    async def unsubscribe_from_group(self):
        if self.subscribed_group:
            await self.channel_layer.group_discard(
                self.subscribed_group, self.channel_name
            )
            self.subscribed_group = ""
            # await self.connected_consumers(group_name, actions="disconnect")

    @staticmethod
    def get_group_name(user=None):
        """Gets all the user group name except user in superadmin group"""
        if user.is_associated_with_company:
            return user.company.slug
        elif user.type != UserType.ADMIN:
            # for moderator and viewer user
            return user.created_by.username
        else:
            return user.username

    @staticmethod
    @database_sync_to_async
    def connected_consumers(group_name: str, actions: str):
        """to get the list of connected list"""
        ConnectedConsumersCache.set_connected_consumers(group_name, actions)

    @staticmethod
    @database_sync_to_async
    def get_user_or_company(group_type, username=None, company_slug=None):
        """Returns tuple(user, company)"""
        if group_type == "company":
            company = CompanyCache.get_company(company_slug)
            return (None, company)
        else:
            user = UserCache.get_user(username)
            return (user, None)
        # handle error if the username is not send form the superadmin

    @staticmethod
    @database_sync_to_async
    def send_initial_data(user, company):
        iot_device_list = []
        if company:
            iot_device_list = IotDeviceCache.get_all_company_iot_devices(company)
        elif user.type == "ADMIN":
            iot_device_list = IotDeviceCache.get_all_user_iot_devices(user)
        else:
            iot_device_list = IotDeviceCache.get_all_user_iot_devices(user.created_by)

        device_sensor_data_qs = (
            SensorData.objects.filter(iot_device__in=iot_device_list)
            .values(
                "device_sensor__sensor__name",
                "iot_device_id",
                "value",
            )
            .annotate(
                latest_timestamp=Subquery(
                    SensorData.objects.filter(
                        device_sensor__sensor__name=OuterRef(
                            "device_sensor__sensor__name"
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

        for data in device_sensor_data_qs:
            iot_device_id = data.pop("iot_device_id")
            data["timestamp"] = timezone.localtime(
                data.pop("latest_timestamp")
            ).strftime("%Y/%m/%d %H:%M:%S")
            sensor_name = data.pop("device_sensor__sensor__name")
            sensor_value = data.pop("value")
            data[sensor_name] = sensor_value
            sensors_data[iot_device_id].update(data)

        return sensors_data
