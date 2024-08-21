from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes
from rest_framework.response import Response

from iot_devices.auth import DeviceAuthentication
from iot_devices.cache import IotDeviceCache
from sensor_data.serializers import IotDeviceSensorDataSerializer
from sensor_data.tasks import send_live_data_to
from sensor_data.utilis import strtobool


@api_view(["POST"])
@authentication_classes([DeviceAuthentication])
def save_sensor_data(request):
    iot_device = request.auth
    if strtobool(request.data.get("is_error", "")):
        return Response(status=status.HTTP_200_OK)

    device_sensors = IotDeviceCache.get_all_device_sensors(iot_device.id)
    if not device_sensors:
        return Response(
            {"error": "No Sensor is associated with the devices"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    serializer = IotDeviceSensorDataSerializer(
        data=request.data,
        context={
            "request": request,
            "iot_device": iot_device,
            "device_sensors": device_sensors,
        },
    )
    serializer.is_valid(raise_exception=True)
    if not serializer.validated_data:
        # this means all the sensor values received are beyond the max and min limit of the device sensor
        return Response(status=status.HTTP_200_OK)

    with transaction.atomic():
        serializer.save()

    username = iot_device.user.username if iot_device.user else None
    company_slug = iot_device.company.slug if iot_device.company else None
    group_name = company_slug if company_slug else username

    # sending data to the websocket
    channel_layer = get_channel_layer()
    timestamp = (
        serializer.validated_data.pop("timestamp")
        .astimezone(timezone.get_default_timezone())
        .strftime("%Y/%m/%d %H:%M:%S")
    )

    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "send_live_data",
            "data": serializer.validated_data,
            "device_id": iot_device.id,
            "timestamp": timestamp,
        },
    )

    # call celery for sending live data to an api end point
    send_live_data_to.delay(
        username=username,
        company_slug=company_slug,
        data=serializer.validated_data,
        iot_device_id=iot_device.id,
        board_id=iot_device.board_id,
        timestamp=timestamp,
    )

    return Response(status=status.HTTP_200_OK)
