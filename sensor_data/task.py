import requests
from asgiref.sync import async_to_sync
from celery import shared_task
from channels.layers import get_channel_layer
from iot_devices.cache import IotDeviceCache
from send_livedata.cache import SendLiveDataCache
from django.utils import timezone


@shared_task
def send_live_data_to(username, company_slug, data, iot_device_id, board_id, timestamp):
    """Sending data to the third party api endpoint"""

    send_livedata_to = (
        SendLiveDataCache.get_send_livedata_by_user(username)
        if username
        else SendLiveDataCache.get_send_livedata_by_company(company_slug)
    )

    if send_livedata_to:
        url = send_livedata_to.endpoint
        if url:
            device_sensors = IotDeviceCache.get_all_device_sensors(iot_device_id)
            sensor_data = {
                device_sensor.sensor.name: (
                    int(data[device_sensor.field_name])
                    if device_sensor.sensor.is_value_boolean
                    else data[device_sensor.field_name]
                )
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
            if send_livedata_to.send_device_board_id:
                sensor_data["timestamp"] = board_id
            try:
                requests.post(url=url, json=sensor_data)
            except Exception:
                pass


@shared_task
def send_data_to_websocket(
    username, company_slug, field_sensor_name_dict, data, iot_device_id
):
    # not in used
    # make sure this processing only happen when actual websocket connection is established
    # simply move this logic inside send_data function in consumers.py
    """
    Function to send data over Websockets
    connects to the send_data function in the consumer.py

    """
    channel_layer = get_channel_layer()

    # defining the group name for admin user or company
    group_name = company_slug if company_slug else username

    localized_timestamp = data["timestamp"].astimezone(timezone.get_default_timezone())
    data["timestamp"] = localized_timestamp.strftime("%Y-%m-%d %H:%M:%S")

    # connects to the Consumers.py and calls send_data function in websocket app
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "send_data",
            "data": data,
            "device_id": iot_device_id,
            "field_sensor_name_dict": field_sensor_name_dict,
        },
    )
