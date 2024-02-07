from collections import defaultdict
from datetime import timedelta
from django.db import transaction
from django.shortcuts import render
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from iot_devices.auth import DeviceAuthentication
from iot_devices.cache import IotDeviceCache
from users.cache import UserCache
from utils.commom_functions import get_groups_tuple
from utils.constants import GroupName
from .models import SensorData
from .serializers import IotDeviceSensorDataSerializer
from .task import send_data_to_websocket, send_live_data_to


def sensor_data_generator(sensor_data_qs):
    for entry in sensor_data_qs:
        iot_device_id = entry["iot_device_id"]
        sensor_name = entry.get("device_sensor__sensor__name", None)
        value = entry["value"]
        timestamp = entry["timestamp"]

        yield iot_device_id, sensor_name, value, timestamp


def process_sensor_data(sensor_data_qs, list_data_by_sensor=False):
    """List the sensor data in the required format"""
    sensors_data = (
        defaultdict(list)
        if list_data_by_sensor
        else defaultdict(lambda: defaultdict(list))
    )

    for iot_device_id, sensor_name, value, timestamp in sensor_data_generator(
        sensor_data_qs
    ):
        if list_data_by_sensor:
            sensors_data[sensor_name].append(
                {"value": value, "timestamp": timestamp, "iot_device_id": iot_device_id}
            )
        else:
            sensors_data[iot_device_id][sensor_name].append(
                {"value": value, "timestamp": timestamp}
            )

    return sensors_data


def get_field_sensor_name_dict(device_sensors):
    return {
        device_sensor.field_name: device_sensor.sensor.name
        for device_sensor in device_sensors
    }


# Api handling of the Sensordata model
@api_view(["POST"])
@authentication_classes([DeviceAuthentication])
def save_sensor_data(request):
    iot_device = request.auth
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
    with transaction.atomic():
        serializer.save()

    field_sensor_name_dict = get_field_sensor_name_dict(device_sensors)
    username = iot_device.user.username if iot_device.user else None
    company_slug = iot_device.company.slug if iot_device.company else None

    # call celery for sending live data to an api end point
    # overall modification needed to send_live_data_to
    # send_live_data_to.delay(
    #     user_id=user_id,
    #     company_slug=company_slug,
    #     field_sensor_name_dict=field_sensor_name_dict,
    #     data=serializer.validated_data,
    #     iot_device_id=iot_device.id,
    # )

    # calling celery background task for sending data to websocket
    send_data_to_websocket.delay(
        username=username,
        company_slug=company_slug,
        field_sensor_name_dict=field_sensor_name_dict,
        data=serializer.validated_data,
        iot_device_id=iot_device.id,
    )

    return Response(status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_sensor_data(request):
    user = UserCache.get_user(username=request.user.username)
    user_groups = get_groups_tuple(user)
    one_month_ago = timezone.now() - timedelta(days=30)
    if GroupName.SUPERADMIN_GROUP in user_groups:
        sensor_data_qs = (
            SensorData.objects.filter(timestamp__gte=one_month_ago)
            .values(
                "device_sensor__sensor__name",
                "iot_device_id",
                "value",
                "timestamp",
            )
            .order_by("-timestamp")
        )

    else:
        # getting the list of the iot_device associated with the admin user or company
        iot_device_list = []
        if user.is_associated_with_company:
            iot_device_list = IotDeviceCache.get_all_company_iot_devices(user.company)
        elif GroupName.ADMIN_GROUP in user_groups:
            iot_device_list = IotDeviceCache.get_all_user_iot_devices(user)
        else:
            iot_device_list = IotDeviceCache.get_all_user_iot_devices(user.created_by)

        sensor_data_qs = (
            SensorData.objects.filter(
                iot_device__id__in=iot_device_list, timestamp__gte=one_month_ago
            )
            .values(
                "device_sensor__sensor__name",
                "iot_device_id",
                "value",
                "timestamp",
            )
            .order_by("-timestamp")
        )

    list_data_by_sensor = request.query_params.get("list_by", None)
    sensors_data = process_sensor_data(
        sensor_data_qs, list_data_by_sensor=(list_data_by_sensor == "sensor")
    )
    return Response(sensors_data, status=status.HTTP_200_OK)
