from django.shortcuts import render
from users.auth import ApiKeyAuthentication
from users.models import AdminUser
from .models import AdminSensor, IotDevice, Sensor, SensorData
from rest_framework.decorators import authentication_classes, api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import SensorDataGetSerializer, SensorDataSerializer, AdminSerializer
from django.db.models import Prefetch
from rest_framework.pagination import PageNumberPagination


# Create your views here.
@api_view(["POST"])
@authentication_classes([ApiKeyAuthentication])
def save_sensor_data(request):
    admin_sensors = AdminSensor.objects.select_related("sensor").filter(
        user=request.user
    )
    serializer = SensorDataSerializer(
        data=request.POST,
        context={
            "request": request,
            "admin_user_sensors": admin_sensors,
        },
    )
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response("ok", status=status.HTTP_200_OK)


@api_view(["GET"])
@authentication_classes([ApiKeyAuthentication])
def get_sensordata(request):
    queryset = AdminUser.objects.prefetch_related(
        Prefetch(
            "iot_device_list",
            queryset=IotDevice.objects.order_by("iot_device_id"),
        ),
        Prefetch("sensor_list__sensor", queryset=Sensor.objects.order_by("name")),
        Prefetch(
            "sensor_list__admin_data_list",
            queryset=SensorData.objects.order_by("timestamp", "iot_device"),
        ),
    ).filter(id=request.user.id)
    serializer = AdminSerializer(queryset, many=True, context={"request": request})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
@authentication_classes([ApiKeyAuthentication])
def sensor_data_view(request):
    admin_user_sensor = AdminSensor.objects.select_related("sensor").filter(
        user=request.user
    )
    sensor_data_qs = (
        SensorData.objects.select_related(
            "iot_device",
        )
        .prefetch_related("admin_user_sensor")
        .filter(admin_user_sensor__in=admin_user_sensor)
        .values(
            "admin_user_sensor__sensor__name", "iot_device_id", "value", "timestamp"
        )
    )

    data = {}
    for sensor in admin_user_sensor:
        sensor_name = sensor.sensor.name
        sensor_data = sensor_data_qs.filter(admin_user_sensor=sensor)
        serializer = SensorDataGetSerializer(
            sensor_data,
            many=True,
            context={"request": request},
        )
        data[sensor_name] = serializer.data

    return Response(data)
