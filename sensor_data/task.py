import requests
from asgiref.sync import async_to_sync
from celery import shared_task
from channels.layers import get_channel_layer

from send_livedata.models import SendLiveDataList

from .utilis import prepare_sensor_data


@shared_task
def send_live_data_to(user_id, company_id, field_sensor_name_dict, data, iot_device_id):
    """Sending data to the third party api endpoint"""

    try:
        send_livedata_to_obj = (
            SendLiveDataList.objects.get(user=user_id)
            if user_id
            else SendLiveDataList.objects.get(company=company_id)
        )
    except SendLiveDataList.DoesNotExist:
        send_livedata_to_obj = None

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
        for url in send_livedata_to_obj.endpoints:
            try:
                requests.post(url=url, json=sensor_data)
            except Exception:
                # continue to the next url in the list
                continue


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
    print("in send_data_to_websocket")
    channel_layer = get_channel_layer()

    # defining the group name for admin user or company
    group_name = company_slug if not company_slug else f"admin-user-{user_id}"

    sensor_data = prepare_sensor_data(
        field_sensor_name_dict,
        data,
        iot_device_id,
        data["timestamp"],
    )

    # sensor_data = {
    #     "field_sensor_name_dict": field_sensor_name_dict,
    #     "data": data,
    #     "iot_device_id": iot_device_id,
    # }

    # connects to the Consumers.py and calls send_data function in websocket app
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "send_data",
            "data": sensor_data,
        },
    )
