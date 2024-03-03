from collections import defaultdict
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from company.cache import CompanyCache
from iot_devices.cache import IotDeviceCache
from sensor_data.models import SensorData
from users.cache import UserCache
from websocket.cache import WebSocketCache
from .models import WebSocketToken
from .utilis import generate_token_key
from django.db.models import Prefetch
from django.db.models import OuterRef, Subquery, Max, F, Window
from django.db.models.functions import RowNumber

# Create your views here.


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def get_websocket_token(request):
    user = request.user
    websocket_token = WebSocketCache.get_websocket_token(user.username)
    if websocket_token is None:
        token_key = generate_token_key()
        while WebSocketToken.objects.filter(token=token_key).exists():
            token_key = generate_token_key()
        websocket_token = WebSocketToken.objects.create(
            user=request.user, token=token_key
        )
        WebSocketCache.set_websocket_token(user.username, websocket_token)
    return Response({"token": websocket_token.token}, status=status.HTTP_200_OK)


@api_view(["GET"])
def initial_data(request):
    user = request.query_params.get("user", None)
    company = request.query_params.get("company", None)

    if company:
        company = CompanyCache.get_company(company)
    else:
        user = UserCache.get_user(user)

    iot_device_list = []
    if company:
        iot_device_list = IotDeviceCache.get_all_company_iot_devices(company=company)
    elif user.type == "ADMIN":
        iot_device_list = IotDeviceCache.get_all_user_iot_devices(user=user)
    else:
        # user is of type Viewer or Moderator
        iot_device_list = IotDeviceCache.get_all_user_iot_devices(user.created_by)

    # device_sensor_data_qs = (
    #     SensorData.objects.filter(iot_device__in=iot_device_list)
    #     .values(
    #         "device_sensor__sensor__name",
    #         "iot_device_id",
    #         "value",
    #         "timestamp",
    #     )
    #     .order_by("-timestamp", "device_sensor__sensor__name")
    # )

    # device_sensor_data_qs = (
    #     SensorData.objects.filter(iot_device__in=iot_device_list)
    #     .annotate(
    #         row_number=Window(
    #             expression=RowNumber(),
    #             partition_by=["device_sensor__sensor__name", "iot_device_id"],
    #             order_by=F("timestamp").desc(),
    #         ),
    #     )
    #     .filter(row_number=1)
    #     .values(
    #         "device_sensor__sensor__name",
    #         "iot_device_id",
    #         "value",
    #         "timestamp",
    #     )
    # )

    # device_sensor_data_qs = (
    #     SensorData.objects.filter(iot_device__in=iot_device_list)
    #     .values(
    #         "device_sensor__sensor__name",
    #         "iot_device_id",
    #     )
    #     .annotate(
    #         latest_timestamp=Max("timestamp"),
    #         value=F("value"),
    #     )
    #     .values(
    #         "device_sensor__sensor__name", "iot_device_id", "value", "latest_timestamp"
    #     )
    # )

    # device_sensor_data_qs = SensorData.objects.filter(iot_device__in=iot_device_list)

    # Use annotate to get the latest timestamp for each device_sensor
    latest_timestamp_subquery = (
        SensorData.objects.filter(device_sensor=OuterRef("device_sensor"))
        .order_by("-timestamp")
        .values("timestamp")[:1]
    )

    # Use these latest timestamps to filter the queryset
    latest_sensor_data_qs = (
        SensorData.objects.select_related("device_sensor", "iot_device")
        .filter(iot_device__in=iot_device_list)
        .filter(timestamp=Subquery(latest_timestamp_subquery))
        .values(
            "device_sensor__sensor__name",
            "iot_device_id",
            "value",
            "timestamp",
        )
    )

    # latest_sensor_data_qs = (
    #     SensorData.objects.filter(iot_device__in=iot_device_list)
    #     .select_related("device_sensor", "iot_device")
    #     .values("device_sensor")
    #     .annotate(latest_timestamp=Max("timestamp"))
    #     .filter(timestamp=F("latest_timestamp"))
    #     .values(
    #         "device_sensor__sensor__name",
    #         "iot_device_id",
    #         "value",
    #         "timestamp",
    #     )
    # )

    sensors_data = defaultdict(dict)

    for data in latest_sensor_data_qs:
        iot_device_id = data.pop("iot_device_id")
        data["timestamp"] = timezone.localtime(data.pop("timestamp")).strftime(
            "%Y/%m/%d %H:%M:%S"
        )
        sensor_name = data.pop("device_sensor__sensor__name")
        sensor_value = data.pop("value")
        data[sensor_name] = sensor_value
        sensors_data[iot_device_id].update(data)

    return Response(sensors_data)
