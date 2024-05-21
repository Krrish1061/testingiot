import json

from channels.db import database_sync_to_async
from channels.exceptions import StopConsumer
from channels.generic.websocket import AsyncWebsocketConsumer

from company.cache import CompanyCache
from iot_devices.cache import IotDeviceCache
from sensor_data.tasks import get_sensor_data
from users.cache import UserCache
from utils.commom_functions import get_groups_tuple
from utils.constants import GroupName, UserType
from websocket.tasks import send_initial_data


class SensorDataConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope["user"]
        user_groups = get_groups_tuple(user)
        self.is_superadmin = (
            True if GroupName.SUPERADMIN_GROUP in user_groups else False
        )

        if not self.is_superadmin:
            group_name = await self.get_group_name(user)
            await self.subscribe_to_group(group_name)
        else:
            self.subscribed_group = ""

        await self.accept()
        if not self.is_superadmin:
            company = user.company
            username = None
            if company is None:
                username = (
                    user.username if user.type == "ADMIN" else user.created_by.username
                )
            company_slug = company.slug if company else None
            send_initial_data.delay(username=username, company_slug=company_slug)
            # initial_data = await self.get_initial_data(user=user, company=user.company)
            # await self.send(text_data=json.dumps(initial_data))

    async def disconnect(self, code):
        if self.subscribed_group:
            await self.channel_layer.group_discard(
                self.subscribed_group, self.channel_name
            )
        raise StopConsumer()

    async def send_live_data(self, event):
        # Send the data to the websocket
        device_id = event["device_id"]
        data = event["data"]
        timestamp = event["timestamp"]
        device_sensor_data = await self.prepare_live_sensors_data(
            device_id, data, timestamp
        )
        await self.send(
            text_data=json.dumps([{"message_type": "live_data"}, device_sensor_data])
        )

    async def send_data(self, event):
        # Send the data to the websocket
        await self.send(text_data=event["data"])

    async def send_binary_data(self, event):
        # Send the data to the websocket
        await self.send(bytes_data=event["data"])

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get("type")

        if message_type == "group_subscribe" and self.is_superadmin:
            company_slug = data.get("company_slug")
            username = data.get("username")
            # handle case when both username and company_slug is send
            group_type = data.get("group_type")
            user, company = await self.get_user_or_company(
                group_type, username=username, company_slug=company_slug
            )
            # here user is the admin user
            group_name = user.username if user else company.slug
            await self.unsubscribe_from_group()
            await self.subscribe_to_group(group_name)
            username = None
            company_slug = company.slug if company else None
            if company is None:
                username = (
                    user.username if user.type == "ADMIN" else user.created_by.username
                )
            send_initial_data.delay(username=username, company_slug=company_slug)
            # initial_data = await self.get_initial_data(user=user, company=company)
            # await self.send(text_data=json.dumps(initial_data))

        elif message_type == "sensor_data":
            sensor_name = data.get("sensor_name")
            iot_device_id = data.get("iot_device_id")
            start_date = data.get("start_date")
            end_date = data.get("end_date")

            get_sensor_data.delay(
                sensor_name,
                iot_device_id,
                channel_name=self.channel_name,
                start_date=start_date,
                end_date=end_date,
            )

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
    def get_user_or_company(group_type, username=None, company_slug=None):
        """Returns tuple(user, company)"""
        if group_type == "company":
            company = CompanyCache.get_company(company_slug)
            return (None, company)
        else:
            user = UserCache.get_user(username)
            return (user, None)

    @staticmethod
    @database_sync_to_async
    def prepare_live_sensors_data(device_id, data, timestamp):
        """Prepare data to send over to client"""
        device_sensors = IotDeviceCache.get_all_device_sensors(device_id)
        sensor_data = {
            device_sensor.sensor.name: data[device_sensor.field_name]
            for device_sensor in device_sensors
            if (
                device_sensor.field_name in data
                and (
                    device_sensor.max_limit is None
                    or data[device_sensor.field_name] <= device_sensor.max_limit
                )
                and (
                    device_sensor.min_limit is None
                    or data[device_sensor.field_name] >= device_sensor.min_limit
                )
            )
        }

        sensor_data["timestamp"] = timestamp
        return {device_id: sensor_data}
