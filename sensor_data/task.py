import requests
from asgiref.sync import async_to_sync
from celery import shared_task
from channels.layers import get_channel_layer
from send_livedata.cache import SendLiveDataCache
from .utilis import prepare_sensor_data
from django.utils import timezone


@shared_task
def send_live_data_to(
    user_id, company_slug, field_sensor_name_dict, data, iot_device_id
):
    """Sending data to the third party api endpoint"""

    send_livedata_to = (
        SendLiveDataCache.get_send_livedata_by_user(user_id)
        if user_id
        else SendLiveDataCache.get_send_livedata_by_company(company_slug)
    )

    if send_livedata_to:
        # only proceed if url exist
        sensor_data = prepare_sensor_data(
            field_sensor_name_dict,
            data,
            iot_device_id,
            data["timestamp"],
        )

        # it is not good practice for sharing email
        # use Device Id
        sensor_data["email"] = (
            send_livedata_to.user.email if user_id else send_livedata_to.company.email
        )

        url = send_livedata_to.endpoint
        if url:
            try:
                requests.post(url=url, json=sensor_data)
            except Exception:
                pass


@shared_task
def send_data_to_websocket(
    username, company_slug, field_sensor_name_dict, data, iot_device_id
):
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
