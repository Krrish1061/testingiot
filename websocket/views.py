from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from iot_devices.cache import IotDeviceCache
from sensor_data.models import SensorData
from websocket.cache import WebSocketCache

from .models import WebSocketToken
from .utilis import generate_token_key
from collections import defaultdict
from django.utils import timezone
from django.db.models import OuterRef, Subquery, Max, F

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
@permission_classes([IsAuthenticated])
def get_initial_data(request):
    username = request.query_params.get("user")
    company_slug = request.query_params.get("company")
    iot_device_list = []
    if company_slug:
        iot_device_list = IotDeviceCache.get_all_company_iot_devices(
            company_slug=company_slug
        )
    else:
        iot_device_list = IotDeviceCache.get_all_user_iot_devices(username=username)

    latest_sensor_data = (
        SensorData.objects.filter(iot_device__in=iot_device_list)
        .values(
            "iot_device",
            "device_sensor",
        )
        .annotate(
            latest_timestamp=Max("timestamp"),
        )
    )

    # Use annotate to get the latest timestamp for each device_sensor
    # latest_timestamp_subquery = (
    #     SensorData.objects.filter(device_sensor=OuterRef("device_sensor"))
    #     .order_by("-timestamp")
    #     .values("timestamp")[:1]
    # )
    # Use these latest timestamps to filter the queryset
    # latest_sensor_data_qs = (
    #     SensorData.objects.select_related("device_sensor", "iot_device").filter(
    #         iot_device__in=iot_device_list
    #     )
    #     # .annotate(time=Max("timestamp"))
    #     # .filter(timestamp=Subquery(latest_sensor_data))
    #     .values(
    #         "device_sensor__sensor__name",
    #         "iot_device_id",
    #         "value",
    #         "timestamp",
    #     )
    #     # .order_by("device_sensor__field_number")
    # )
    latest_sensor_data_qs = (
        SensorData.objects.filter(
            timestamp__in=Subquery(latest_sensor_data.values("latest_timestamp")),
        )
        .select_related("device_sensor__sensor", "iot_device")
        .values("device_sensor__sensor__name", "iot_device_id", "value", "timestamp")
        .order_by("iot_device", "device_sensor__field_number")
    )

    # print(latest_sensor_data_qs)

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

    return Response(sensors_data, status=status.HTTP_200_OK)
