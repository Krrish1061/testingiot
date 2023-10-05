from celery import shared_task
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.utils import timezone
from send_livedata.models import SendLiveDataList
import requests


def prepare_sensor_data(field_sensor_name_dict, data, iot_device_id, timestamp):
    """
    sensor data prepared in format
    {
        "sensor_name": sensor value,
        "sensor_name": sensor value,
        "iot_device_id": 6,
        "timestamp": %Y-%m-%d %H:%M:%S
    }

    """
    sensor_data = {
        sensor_name: data[field_name]
        for field_name, sensor_name in field_sensor_name_dict.items()
        if field_name in data
    }

    sensor_data["iot_device_id"] = iot_device_id
    localized_timestamp = timestamp.astimezone(timezone.get_default_timezone())
    formatted_timestamp = localized_timestamp.strftime("%Y-%m-%d %H:%M:%S")
    sensor_data["timestamp"] = formatted_timestamp
    return sensor_data


# def send_data_to_group(user, company, sensor_obj_list, data, iot_device_id):
#     """
#     Function to send data over Websockets
#     connects to the send_data function in the consumer.py
#     """
#     channel_layer = get_channel_layer()

#     # defining the group name for admin user or company
#     group_name = company.slug if company else f"admin-user-{user.id}"

#     sensor_data = prepare_sensor_data(
#         sensor_obj_list, data, iot_device_id, data["timestamp"]
#     )

#     # connects to the Consumers.py and calls send_data function in websocket app
#     async_to_sync(channel_layer.group_send)(
#         group_name,
#         {
#             "type": "send_data",
#             "data": sensor_data,
#         },
#     )


@shared_task
def send_live_data_to(user_id, company_id, field_sensor_name_dict, data, iot_device_id):
    """Sending data to the third party apiendpoint"""
    send_livedata_to_obj = (
        SendLiveDataList.objects.filter(user=user_id)
        if user_id
        else SendLiveDataList.objects.filter(company=company_id)
    )

    if send_livedata_to_obj:
        sensor_data = prepare_sensor_data(
            field_sensor_name_dict,
            data,
            iot_device_id,
            data["timestamp"],
        )
        sensor_data["user_email"] = (
            send_livedata_to_obj.user.email
            if user_id
            else send_livedata_to_obj.company.email
        )
        # url = "https://coldstorenepal.com/api/root/sensor/get-data"
        # url = "https://tserver.devchandant.com/api/root/sensor/get-data"
        url = send_livedata_to_obj.endpoint
        try:
            requests.post(url=url, json=sensor_data)
        except Exception:
            pass


@shared_task
def send_data_to_websocket(
    user_id, company_slug, field_sensor_name_dict, data, iot_device_id
):
    # make sure this processing only happen when actual websocket connection is established
    # simply move this logic inside send_data function in consumers.py
    """
    Function to send data over Websockets
    connects to the send_data function in the consumer.py

    """
    channel_layer = get_channel_layer()

    # defining the group name for admin user or company
    group_name = company_slug if not company_slug else f"admin-user-{user_id}"

    sensor_data = prepare_sensor_data(
        field_sensor_name_dict,
        data,
        iot_device_id,
        data["timestamp"],
    )

    # connects to the Consumers.py and calls send_data function in websocket app
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "send_data",
            "data": sensor_data,
        },
    )
