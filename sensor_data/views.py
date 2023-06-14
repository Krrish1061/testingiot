from datetime import timedelta
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ObjectDoesNotExist
from django.core.paginator import EmptyPage, PageNotAnInteger
from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from users.auth import ApiKeyAuthentication
from company.models import Company

from .models import CompanySensor, IotDevice, Sensor, SensorData
from .pagination import SensorDataPaginator
from .serializers import (
    IotDeviceSerializer,
    SensorDataSerializer,
    SensorSerializer,
    CompanySensorSerializer,
)


User = get_user_model()
# Create your views here.


# Api handling of the Sensordata model
@api_view(["POST"])
@authentication_classes([ApiKeyAuthentication])
def save_sensor_data(request):
    company_sensors = CompanySensor.objects.select_related("sensor").filter(
        company=request.user.company
    )
    serializer = SensorDataSerializer(
        data=request.data,
        context={
            "request": request,
            "company_sensors": company_sensors,
        },
    )
    serializer.is_valid(raise_exception=True)
    with transaction.atomic():
        serializer.save()
    return Response("ok", status=status.HTTP_200_OK)


@api_view(["GET"])
# @authentication_classes([ApiKeyAuthentication])
@permission_classes([IsAuthenticated])
def sensor_data_view(request):
    company_sensor = (
        CompanySensor.objects.select_related("sensor")
        .filter(company=request.user.company)
        .values("id", "sensor__name")
    )

    sensor_names = {sensor__name["sensor__name"] for sensor__name in company_sensor}
    one_month_ago = timezone.now() - timedelta(days=30)

    sensor_data_qs = (
        SensorData.objects.select_related("iot_device", "company_sensor")
        .filter(company_sensor__id__in=company_sensor.values("id"))
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
        page_number = int(request.query_params["page"])
    except (KeyError, ValueError):
        page_number = 1

    try:
        page = paginator.page(page_number, request)
    except (EmptyPage, PageNotAnInteger):
        return Response(
            {"error": "Invalid page Number or EmptyPage"},
            status=status.HTTP_404_NOT_FOUND,
        )

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
        iot_device = IotDevice.objects.select_related("company").get(pk=id)
    except ObjectDoesNotExist:
        return Response(
            {"error": f"Iot device does not exists"}, status=status.HTTP_404_NOT_FOUND
        )

    if request.method == "GET":
        if iot_device.company != request.user.company:
            return Response(
                {
                    "error": f"Requested Iot device is not associated with the {request.user.company.upper()} company."
                },
                status=status.HTTP_403_FORBIDDEN,
            )
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
            {"error": "Method not allowed"},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
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


# @login_required
@api_view(["GET", "PATCH", "DELETE"])
# @permission_classes([IsAuthenticated])
@authentication_classes([ApiKeyAuthentication])
def sensor(request, name):
    try:
        sensor = Sensor.objects.get(name=name)
    except ObjectDoesNotExist:
        return Response(
            {"error": "Sensor does not exists"}, status=status.HTTP_404_NOT_FOUND
        )

    if request.method == "GET":
        if (
            CompanySensor.objects.select_related("company")
            .filter(company=request.user.company, sensor=sensor)
            .exists()
            or request.user.type == "SUPERADMIN"
        ):
            serializer = SensorSerializer(sensor)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(
                {
                    "error": f"Requested {sensor} sensor is not associated with the {request.user.company.name.upper()} company."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

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


#  Api handling of the CompanySensor model
# @login_required
@api_view(["POST"])
# @permission_classes([IsAuthenticated])
@authentication_classes([ApiKeyAuthentication])
def create_company_sensor(request):
    if User.objects.filter(pk=request.user.id, groups__name="super_admin").exists():
        sensor_name = Sensor.objects.all().values_list("name", flat=True)
        serializer = CompanySensorSerializer(
            data=request.data,
            context={"sensor_name": sensor_name},
        )
        serializer.is_valid(raise_exception=True)
        print("in view", serializer.validated_data)
        serializer.save()

        return Response("ok", status=status.HTTP_200_OK)
    else:
        return Response(
            {"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN
        )
