import json
from collections import defaultdict
from datetime import timedelta
from itertools import chain

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.paginator import EmptyPage, PageNotAnInteger
from django.db import transaction
from django.db.models import F, Window
from django.db.models.functions import RowNumber
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

from caching.cache import Cache
from caching.cache_key import (
    ADMIN_USER_SENSOR_APP_NAME,
    COMPANY_SENSOR_APP_NAME,
    get_admin_user_sensor_cache_key,
    get_company_sensor_cache_key,
)
from company.models import Company
from iot_devices.auth import DeviceAuthentication
from iot_devices.models import IotDevice
from send_livedata.models import SendLiveDataList
from sensors.models import AdminUserSensor, CompanySensor, Sensor
from utils.constants import UserType
from utils.error_message import (
    ERROR_NO_SENSOR_ASSOCIATED_WITH_ADMIN_USER,
    ERROR_NO_SENSOR_ASSOCIATED_WITH_COMPANY,
)
from .task import send_data_to_websocket, send_live_data_to
from .models import AdminUserSensorData, CompanySensorData
from .serializers import AdminUserSensorDataSerializer, CompanySensorDataSerializer

User = get_user_model()


def sensor_data_generator(sensor_data_qs):
    for entry in sensor_data_qs:
        iot_device_id = entry["iot_device_id"]
        sensor_name = entry.get("user_sensor__sensor__name", None) or entry.get(
            "company_sensor__sensor__name", None
        )
        value = entry["value"]
        timestamp = entry["timestamp"]

        yield iot_device_id, sensor_name, value, timestamp


def get_sensor_list(user):
    """Getting the list of the Sensors associated with the Company or Admin User"""
    if user.is_associated_with_company:
        cache_key = get_company_sensor_cache_key(user.company.slug)
        company_sensors = Cache.get_all(
            cache_key=cache_key,
            app_name=COMPANY_SENSOR_APP_NAME,
        )
        if company_sensors is None:
            company_sensors = CompanySensor.objects.select_related(
                "sensor", "company"
            ).filter(company=user.company)

            Cache.set_all(
                cache_key=cache_key,
                app_name=COMPANY_SENSOR_APP_NAME,
                data=company_sensors,
            )

        return [company_sensor.id for company_sensor in company_sensors]
    else:
        cache_key = get_admin_user_sensor_cache_key(user.username)
        admin_user_sensors = Cache.get_all(
            cache_key=cache_key,
            app_name=ADMIN_USER_SENSOR_APP_NAME,
        )
        if admin_user_sensors is None:
            admin_user_sensor = AdminUserSensor.objects.select_related(
                "sensor", "company"
            ).filter(user=user)

            Cache.set_all(
                cache_key=cache_key,
                app_name=ADMIN_USER_SENSOR_APP_NAME,
                data=admin_user_sensor,
            )
        return [admin_user_sensor.id for admin_user_sensor in admin_user_sensors]


def get_field_sensor_name_dict(user_or_company_sensors):
    return {
        user_or_company_sensor.field_name: user_or_company_sensor.sensor.name
        for user_or_company_sensor in user_or_company_sensors
    }


# Api handling of the Sensordata model
@api_view(["POST"])
@authentication_classes([DeviceAuthentication])
def save_sensor_data(request):
    if request.user:
        iot_device = request.auth
        cache_key = get_admin_user_sensor_cache_key(request.user.username)
        admin_user_sensors = Cache.get_all(
            cache_key=cache_key,
            app_name=ADMIN_USER_SENSOR_APP_NAME,
        )
        if admin_user_sensors is None:
            admin_user_sensors = AdminUserSensor.objects.select_related(
                "sensor", "user"
            ).filter(user=request.user)
            Cache.set_all(
                cache_key=cache_key,
                app_name=ADMIN_USER_SENSOR_APP_NAME,
                data=admin_user_sensors,
            )

        if not admin_user_sensors:
            return Response(
                {"error": ERROR_NO_SENSOR_ASSOCIATED_WITH_ADMIN_USER},
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
        with transaction.atomic():
            serializer.save()

        field_sensor_name_dict = get_field_sensor_name_dict(admin_user_sensors)
        # call celery for sending live data to an api end point
        send_live_data_to.delay(
            user_id=request.user.id,
            company_id=None,
            field_sensor_name_dict=field_sensor_name_dict,
            data=serializer.validated_data,
            iot_device_id=iot_device.id,
        )
        # calling celery background task for sending data to websocket
        send_data_to_websocket.delay(
            user_id=request.user.id,
            company_slug=None,
            field_sensor_name_dict=field_sensor_name_dict,
            data=serializer.validated_data,
            iot_device_id=iot_device.id,
        )
        return Response(status=status.HTTP_200_OK)

    else:
        iot_device, company = request.auth
        cache_key = get_company_sensor_cache_key(company.slug)
        company_sensors = Cache.get_all(
            cache_key=cache_key,
            app_name=COMPANY_SENSOR_APP_NAME,
        )

        if company_sensors is None:
            company_sensors = CompanySensor.objects.select_related(
                "sensor", "company"
            ).filter(company=company)
            Cache.set_all(
                cache_key=cache_key,
                app_name=COMPANY_SENSOR_APP_NAME,
                data=company_sensors,
            )

        if not company_sensors:
            return Response(
                {"error": ERROR_NO_SENSOR_ASSOCIATED_WITH_COMPANY},
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
            serializer.save()

        field_sensor_name_dict = get_field_sensor_name_dict(company_sensors)
        # call celery for sending live data to an api end point
        send_live_data_to.delay(
            user_id=None,
            company_id=company.id,
            field_sensor_name_dict=field_sensor_name_dict,
            data=serializer.validated_data,
            iot_device_id=iot_device.id,
        )

        # calling celery background task for sending data to websocket
        send_data_to_websocket.delay(
            user_id=None,
            company_slug=company.slug,
            field_sensor_name_dict=field_sensor_name_dict,
            data=serializer.validated_data,
            iot_device_id=iot_device.id,
        )
        return Response(status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def sensor_data_view(request):
    # testing.delay("cat dog")
    one_month_ago = timezone.now() - timedelta(days=30)
    if request.user.type == UserType.SUPERADMIN:
        # getting sensor data for the company
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

        # getting sensor data for the admin user
        admin_user_sensor_data_qs = (
            AdminUserSensorData.objects.filter(timestamp__gte=one_month_ago)
            .values(
                "user_sensor__sensor__name",
                "iot_device_id",
                "value",
                "timestamp",
            )
            .order_by("-timestamp")
        )

        # combining the queryset for both company and admin user
        combined_sensor_data = sorted(
            chain(company_sensor_data_qs, admin_user_sensor_data_qs),
            key=lambda data: data["timestamp"],
            reverse=True,
        )

        # converting data into the required format
        sensors_data = defaultdict(list)
        for iot_device_id, sensor_name, value, timestamp in sensor_data_generator(
            combined_sensor_data
        ):
            sensors_data[sensor_name].append(
                {"value": value, "timestamp": timestamp, "iot_device_id": iot_device_id}
            )

    else:
        # getting the list of the sensor associated with the admin user or company
        sensor_list = get_sensor_list(request.user)

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
        for iot_device_id, sensor_name, value, timestamp in sensor_data_generator(
            sensor_data_qs
        ):
            sensors_data[sensor_name].append(
                {"value": value, "timestamp": timestamp, "iot_device_id": iot_device_id}
            )

    # Response format
    # {
    #     "temperature": [
    #         {
    #             "value": 20.0,
    #             "timestamp": "2023-09-13T08:30:33Z",
    #             "iot_device_id": 4,
    #         },
    #     ],
    #     "humidity": [
    #         {
    #             "value": 20.0,
    #             "timestamp": "2023-09-05T09:49:16.677679Z",
    #             "iot_device_id": 1,
    #         },
    #     ],
    # }

    return Response(sensors_data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def sensorData_by_iotdevice(request):
    one_week_ago = timezone.now() - timedelta(days=70)
    sensors_data = defaultdict(lambda: defaultdict(list))
    if request.user.type == UserType.SUPERADMIN:
        company_sensor_data_qs = (
            CompanySensorData.objects.filter(timestamp__gte=one_week_ago)
            .values(
                "company_sensor__sensor__name",
                "iot_device_id",
                "value",
                "timestamp",
            )
            .order_by("-timestamp")
        )
        admin_user_sensor_data_qs = (
            AdminUserSensorData.objects.filter(timestamp__gte=one_week_ago)
            .values("user_sensor__sensor__name", "iot_device_id", "value", "timestamp")
            .order_by("-timestamp")
        )

        combined_sensor_data = sorted(
            chain(company_sensor_data_qs, admin_user_sensor_data_qs),
            key=lambda data: data["timestamp"],
            reverse=True,
        )

        for iot_device_id, sensor_name, value, timestamp in sensor_data_generator(
            combined_sensor_data
        ):
            sensors_data[iot_device_id][sensor_name].append(
                {"value": value, "timestamp": timestamp}
            )
    else:
        sensor_list = get_sensor_list(request.user)
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
                .filter(timestamp__gte=one_week_ago)
                .order_by("-timestamp")
            )
            if request.user.is_associated_with_company
            else (
                AdminUserSensorData.objects.select_related("user_sensor")
                .filter(user_sensor__id__in=sensor_list)
                .values(
                    "user_sensor__sensor__name", "iot_device_id", "value", "timestamp"
                )
                .filter(timestamp__gte=one_week_ago)
                .order_by("-timestamp")
            )
        )

        for iot_device_id, sensor_name, value, timestamp in sensor_data_generator(
            sensor_data_qs
        ):
            sensors_data[iot_device_id][sensor_name].append(
                {"value": value, "timestamp": timestamp}
            )

    # Response format
    # {
    #     "4": {
    #         "temperature": [
    #             {
    #                 "value": 20.0,
    #                 "timestamp": "2023-09-13T08:30:33Z",
    #             }
    #         ]
    #     },
    #     "1": {
    #         "temperature": [
    #             {
    #                 "value": 30.0,
    #                 "timestamp": "2023-09-05T09:49:16.677679Z",
    #             },
    #         ],
    #         "humidity": [
    #             {
    #                 "value": 20.0,
    #                 "timestamp": "2023-09-05T09:49:16.677679Z",
    #             },
    #         ],
    #     },
    # }

    return Response(sensors_data, status=status.HTTP_200_OK)
