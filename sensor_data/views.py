from users.auth import ApiKeyAuthentication
from users.models import AdminUser
from .models import AdminSensor, IotDevice, Sensor, SensorData
from rest_framework.decorators import (
    authentication_classes,
    api_view,
    permission_classes,
)
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.exceptions import NotFound

from .serializers import (
    SensorDataSerializer,
    AdminSerializer,
    IotDeviceSerializer,
    SensorSerializer,
    AdminUserSensorSerializer,
)
from .pagination import SensorDataPaginator
from django.db.models import Prefetch
from django.db import transaction
from django.utils import timezone
from datetime import timedelta
from django.core.paginator import EmptyPage, PageNotAnInteger
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ObjectDoesNotExist

User = get_user_model()


# Create your views here.


# Api handling of the Sensordata model
@api_view(["POST"])
@authentication_classes([ApiKeyAuthentication])
def save_sensor_data(request):
    admin_sensors = AdminSensor.objects.select_related("sensor").filter(
        user=request.user
    )
    serializer = SensorDataSerializer(
        data=request.data,
        context={
            "request": request,
            "admin_user_sensors": admin_sensors,
        },
    )
    serializer.is_valid(raise_exception=True)
    with transaction.atomic():
        serializer.save()
    return Response("ok", status=status.HTTP_200_OK)


@api_view(["GET"])
@authentication_classes([ApiKeyAuthentication])
def get_sensordata(request):
    one_month_ago = timezone.now() - timedelta(days=30)
    queryset = AdminUser.objects.prefetch_related(
        Prefetch(
            "iot_device_list",
            queryset=IotDevice.objects.order_by("iot_device_id"),
        ),
        Prefetch("sensor_list__sensor", queryset=Sensor.objects.order_by("name")),
        Prefetch(
            "sensor_list__admin_data_list",
            queryset=SensorData.objects.filter(timestamp__gte=one_month_ago).order_by(
                "timestamp"
            ),
        ),
    ).filter(id=request.user.id)
    serializer = AdminSerializer(queryset, many=True, context={"request": request})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
@authentication_classes([ApiKeyAuthentication])
def sensor_data_view(request):
    admin_user_sensor = (
        AdminSensor.objects.select_related("sensor")
        .filter(user_id=request.user.id)
        .values("id", "sensor__name")
    )

    # sensor_names = {admin_sensor.sensor.name for admin_sensor in admin_user_sensor}
    sensor_names = {sensor__name["sensor__name"] for sensor__name in admin_user_sensor}
    one_month_ago = timezone.now() - timedelta(days=30)

    sensor_data_qs = (
        SensorData.objects.select_related("iot_device", "admin_user_sensor")
        .filter(admin_user_sensor__id__in=admin_user_sensor.values("id"))
        .values("iot_device_id", "value", "timestamp")
        .filter(timestamp__gte=one_month_ago)
        .order_by("-timestamp")
    )

    try:
        page_size = int(request.query_params["page_size"])
    except (KeyError, ValueError):
        page_size = 25

    paginator = SensorDataPaginator(
        sensor_data_qs, page_size, sensor_names=sensor_names
    )

    try:
        page_number = request.query_params["page"]
    except (KeyError, ValueError):
        page_number = 1

    try:
        page = paginator.page(page_number, request)
    except (EmptyPage, PageNotAnInteger):
        raise NotFound("Invalid page Number or EmptyPage")

    response = {
        "count": paginator.count,
        "total-pages": paginator.num_pages,
        "next": paginator.get_next_link(page=page, request=request),
        "previous": paginator.get_previous_link(page=page, request=request),
        "results": page.object_list,
    }

    return Response(response)


#  Api handling of the iot-device


@login_required
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_iot_device(request):
    if User.objects.filter(pk=request.user.id, groups__name="super_admin").exists():
        serializer = IotDeviceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        return Response(
            {"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN
        )


@login_required
@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
@authentication_classes([ApiKeyAuthentication])
def iot_device(request, id):
    try:
        iot_device = IotDevice.objects.get(pk=id)
    except ObjectDoesNotExist:
        return Response(
            {"error": "Iot device does not exists"}, status=status.HTTP_404_NOT_FOUND
        )

    if request.method == "GET":
        # Implement a method such that only a user associated with the company can see their detail only
        serializer = IotDeviceSerializer(iot_device)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == "PATCH":
        if User.objects.filter(pk=request.user.id, groups__name="super_admin").exists():
            serializer = IotDeviceSerializer(
                iot_device, data=request.data, partial=True
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == "DELETE":
        if User.objects.filter(pk=request.user.id, groups__name="super_admin").exists():
            iot_device.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
    else:
        return Response(
            {"error": "Method not allowed"}, status=status.HTTP_405_METHOD_NOT_ALLOWED
        )


#  Api handling of the Sensor model
@login_required
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_sensor(request):
    if User.objects.filter(pk=request.user.id, groups__name="super_admin").exists():
        serializer = SensorSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        return Response(
            {"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN
        )


@login_required
@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
@authentication_classes([ApiKeyAuthentication])
def sensor(request, name):
    try:
        sensor = Sensor.objects.get(name=name)
    except ObjectDoesNotExist:
        return Response(
            {"error": "Sensor does not exists"}, status=status.HTTP_404_NOT_FOUND
        )

    if request.method == "GET":
        # Implement a method such that only a user associated with the company can see their detail only
        serializer = SensorSerializer(sensor)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == "PATCH":
        if User.objects.filter(pk=request.user.id, groups__name="super_admin").exists():
            serializer = SensorSerializer(sensor, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == "DELETE":
        if User.objects.filter(pk=request.user.id, groups__name="super_admin").exists():
            sensor.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
    else:
        return Response(
            {"error": "Method not allowed"}, status=status.HTTP_405_METHOD_NOT_ALLOWED
        )


#  Api handling of the AdminSensor model
