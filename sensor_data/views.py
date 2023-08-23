from collections import defaultdict
from datetime import timedelta
from django.utils import timezone
import json
from django.contrib.auth import get_user_model
from django.core.paginator import EmptyPage, PageNotAnInteger
from django.db import transaction
from django.db.models import Window, F
from django.db.models.functions import RowNumber
from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.cache import cache
from users.auth import ApiKeyAuthentication
from iot_devices.auth import DeviceAuthentication
from company.models import Company
from .models import CompanySensorData, AdminUserSensorData
from iot_devices.models import IotDevice
from send_livedata.models import SendLiveDataList
from sensors.models import Sensor, CompanySensor, AdminUserSensor
from .pagination import SensorDataPaginator
from .serializers import (
    AdminUserSensorDataSerializer,
    CompanySensorDataSerializer,
)
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
import redis
from itertools import chain
import requests


User = get_user_model()


def prepare_sensor_data(sensor_obj_list, data, iot_device_id, timestamp):
    """
    sensor data prepared in format
    {
        "sensor_name": sensor value,
        "sensor_name": sensor value,
        "iot_device_id": 6,
        "timestamp": %Y-%m-%d %H:%M:%S
    }

    """
    sensor_data = {}

    for sensor_obj in sensor_obj_list:
        field_name = sensor_obj.field_name
        if field_name in data:
            sensor_data[sensor_obj.sensor.name] = data[field_name]

    sensor_data["iot_device_id"] = iot_device_id
    localized_timestamp = timestamp.astimezone(timezone.get_default_timezone())
    formatted_timestamp = localized_timestamp.strftime("%Y-%m-%d %H:%M:%S")
    sensor_data["timestamp"] = formatted_timestamp

    return sensor_data


# Handling Caching to get the data
def send_data_to_group(user, company, sensor_obj_list, data, iot_device_id):
    """
    Function to send data over Websockets
    connects to the send_data function in the consumer.py
    """
    channel_layer = get_channel_layer()

    group_name = company.slug if not user else f"admin-user-{user.id}"

    sensor_data = prepare_sensor_data(
        sensor_obj_list, data, iot_device_id, data["timestamp"]
    )

    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "send_data",
            "data": sensor_data,
        },
    )


# Create your views here.
# Api handling of the Sensordata model
@api_view(["POST"])
@authentication_classes([DeviceAuthentication])
def save_sensor_data(request):
    if request.user:
        iot_device = request.auth
        admin_user_sensors = AdminUserSensor.objects.select_related("sensor").filter(
            user=request.user
        )
        if not admin_user_sensors:
            return Response(
                {"error": "No sensor is associated with the Admin user"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = AdminUserSensorDataSerializer(
            data=request.data,
            context={
                "iot_device": iot_device,
                "request": request,
                "admin_user_sensors": admin_user_sensors,
            },
        )
        serializer.is_valid(raise_exception=True)
        # is it necessary ??
        with transaction.atomic():
            datas = serializer.save()

        if SendLiveDataList.objects.filter(user=datas[0].user_sensor.user).exists():
            print("hello")
            sensor_data = {}
            sensor_data["user_email"] = datas[0].user_sensor.user.email
            sensor_data["iot_device_id"] = datas[0].iot_device.id
            sensor_data["timestamp"] = (
                datas[0]
                .timestamp.astimezone(timezone.get_default_timezone())
                .strftime("%Y-%m-%d %H:%M:%S")
            )
            for data in datas:
                sensor_data[data.user_sensor.sensor.name] = data.value

            # set url to SendLiveDataList.objects.filter(user=datas[0].user_sensor.user).endpoint

            url = "https://coldstorenepal.com/api/root/sensor/get-data"
            # "https://tserver.devchandant.com/api/root/sensor/get-data"
            try:
                requests.post(url=url, json=sensor_data)
            except requests.exceptions.RequestException as e:
                pass

        #  websocket
        send_data_to_group(
            user=request.user,
            company=None,
            sensor_obj_list=admin_user_sensors,
            data=serializer.validated_data,
            iot_device_id=iot_device.id,
        )

        return Response(status=status.HTTP_200_OK)

    else:
        iot_device, company = request.auth
        # handle what will happen when company sensor is empty make error message consistence
        company_sensors = CompanySensor.objects.select_related("sensor").filter(
            company=company
        )
        if not company_sensors:
            return Response(
                {"error": "No sensor is associated with the company"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = CompanySensorDataSerializer(
            data=request.data,
            context={
                "iot_device": iot_device,
                "request": request,
                "company_sensors": company_sensors,
            },
        )
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            datas = serializer.save()

        if SendLiveDataList.objects.filter(
            company=datas[0].company_sensor.company
        ).exists():
            print("hello")
            sensor_data = {}
            sensor_data["user_email"] = datas[0].company_sensor.company.email
            sensor_data["iot_device_id"] = datas[0].iot_device.id
            sensor_data["timestamp"] = (
                datas[0]
                .timestamp.astimezone(timezone.get_default_timezone())
                .strftime("%Y-%m-%d %H:%M:%S")
            )
            for data in datas:
                sensor_data[data.company_sensor.sensor.name] = data.value
            # set url to SendLiveDataList.objects.filter(user=datas[0].user_sensor.user).endpoint
            # url = "https://tserver.devchandant.com/api/root/sensor/get-data"
            url = "https://coldstorenepal.com/api/root/sensor/get-data"
            try:
                requests.post(url, json=sensor_data)
            except requests.exceptions.RequestException as e:
                pass
        # websocket
        send_data_to_group(
            user=None,
            company=company,
            sensor_obj_list=company_sensors,
            data=serializer.validated_data,
            iot_device_id=iot_device.id,
        )
        return Response(status=status.HTTP_200_OK)


@api_view(["GET"])
# @authentication_classes([ApiKeyAuthentication])
@permission_classes([IsAuthenticated])
def sensor_data_view(request):
    one_month_ago = timezone.now() - timedelta(days=30)
    if request.user.type == "SUPERADMIN":
        company_sensor_data_qs = (
            CompanySensorData.objects.filter(timestamp__gte=one_month_ago)
            .values(
                "company_sensor__sensor__name", "iot_device_id", "value", "timestamp"
            )
            .order_by("-timestamp")
        )
        admin_user_sensor_data_qs = (
            AdminUserSensorData.objects.filter(timestamp__gte=one_month_ago)
            .values("user_sensor__sensor__name", "iot_device_id", "value", "timestamp")
            .order_by("-timestamp")
        )

        combined_sensor_data = sorted(
            chain(company_sensor_data_qs, admin_user_sensor_data_qs),
            key=lambda data: data["timestamp"],
            reverse=True,
        )

        sensors_data = defaultdict(list)
        for data in combined_sensor_data:
            sensor_name = data.pop("company_sensor__sensor__name", None) or data.pop(
                "user_sensor__sensor__name", None
            )
            sensors_data[sensor_name].append(data)
        return Response(sensors_data)

    else:
        sensor_list = (
            CompanySensor.objects.filter(company=request.user.company).values_list(
                "id", flat=True
            )
            if request.user.is_associated_with_company
            else (
                AdminUserSensor.objects.filter(user=request.user).values_list(
                    "id", flat=True
                )
            )
        )

        if not sensor_list:
            return Response(
                f"No sensor associated with the {request.user.comapany if request.user.is_associated_with_company else request.user}"
            )

        sensor_data_qs = (
            (
                CompanySensorData.objects.select_related("company_sensor")
                .filter(company_sensor__id__in=sensor_list)
                .values(
                    "company_sensor__sensor__name",
                    "iot_device_id",
                    "value",
                    "timestamp",
                )
                .filter(timestamp__gte=one_month_ago)
                .order_by("-timestamp")
            )
            if request.user.is_associated_with_company
            else (
                AdminUserSensorData.objects.select_related("user_sensor")
                .filter(user_sensor__id__in=sensor_list)
                .values(
                    "user_sensor__sensor__name", "iot_device_id", "value", "timestamp"
                )
                .filter(timestamp__gte=one_month_ago)
                .order_by("-timestamp")
            )
        )
        sensors_data = defaultdict(list)
        for data in sensor_data_qs:
            sensor_name = data.pop("company_sensor__sensor__name", None) or data.pop(
                "user_sensor__sensor__name", None
            )
            sensors_data[sensor_name].append(data)
        return Response(sensors_data)


@api_view(["GET"])
@authentication_classes([ApiKeyAuthentication])
# @permission_classes([IsAuthenticated])
def sensorData_by_iotdevice(request):
    one_month_ago = timezone.now() - timedelta(days=30)
    if request.user.type == "SUPERADMIN":
        company_sensor_data_qs = (
            CompanySensorData.objects.filter(timestamp__gte=one_month_ago)
            .values(
                "company_sensor__sensor__name",
                "iot_device_id",
                "value",
                "timestamp",
            )
            .order_by("-timestamp")
        )
        admin_user_sensor_data_qs = (
            AdminUserSensorData.objects.filter(timestamp__gte=one_month_ago)
            .values("user_sensor__sensor__name", "iot_device_id", "value", "timestamp")
            .order_by("-timestamp")
        )

        combined_sensor_data = sorted(
            chain(company_sensor_data_qs, admin_user_sensor_data_qs),
            key=lambda data: data["timestamp"],
            reverse=True,
        )

        sensors_data = defaultdict(list)
        for data in combined_sensor_data:
            sensor_name = data.pop("company_sensor__sensor__name", None) or data.pop(
                "user_sensor__sensor__name", None
            )
            sensors_data[sensor_name].append(data)
        return Response(sensors_data)

    else:
        sensor_list = (
            CompanySensor.objects.filter(company=request.user.company).values_list(
                "id", flat=True
            )
            if request.user.is_associated_with_company
            else (
                AdminUserSensor.objects.filter(user=request.user).values_list(
                    "id", flat=True
                )
            )
        )

        if not sensor_list:
            return Response(
                f"No sensor associated with the {request.user.comapany if request.user.is_associated_with_company else request.user}"
            )

        sensor_data_qs = (
            (
                CompanySensorData.objects.select_related("company_sensor")
                .filter(company_sensor__id__in=sensor_list)
                .values(
                    "company_sensor__sensor__name",
                    "iot_device_id",
                    "value",
                    "timestamp",
                )
                .filter(timestamp__gte=one_month_ago)
                .order_by("-timestamp")
            )
            if request.user.is_associated_with_company
            else (
                AdminUserSensorData.objects.select_related("user_sensor")
                .filter(user_sensor__id__in=sensor_list)
                .values(
                    "user_sensor__sensor__name", "iot_device_id", "value", "timestamp"
                )
                .filter(timestamp__gte=one_month_ago)
                .order_by("-timestamp")
            )
        )
        sensors_data = defaultdict(list)
        for data in sensor_data_qs:
            sensor_name = data.pop("company_sensor__sensor__name", None) or data.pop(
                "user_sensor__sensor__name", None
            )
            sensors_data[sensor_name].append(data)
        return Response(sensors_data)
