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
from django.db import connection

# Create your views here.


def dictfetchall(cursor):
    """
    Return all rows from a cursor as a dict.
    Assume the column names are unique.
    """
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]


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
    iot_device_list = (
        IotDeviceCache.get_all_company_iot_devices(company_slug=company_slug)
        if company_slug
        else IotDeviceCache.get_all_user_iot_devices(username=username)
    )
    sensors_data = defaultdict(dict)
    # use this if below code takes too much time
    # for device_id in iot_device_list:
    #     device_sensor_list = IotDeviceCache.get_all_device_sensors(device_id=device_id)
    #     for device_sensor in device_sensor_list:
    #         query = (
    #             SensorData.objects.select_related(
    #                 "device_sensor__sensor",
    #             )
    #             .filter(iot_device_id=device_id, device_sensor_id=device_sensor)
    #             .values(
    #                 "device_sensor__sensor__name",
    #                 "iot_device_id",
    #                 "value",
    #                 "timestamp",
    #             )
    #             .order_by("-timestamp")[:1]
    #         )
    #         for data in query:
    #             iot_device_id = data.pop("iot_device_id")
    #             print(data["timestamp"])
    #             data["timestamp"] = timezone.localtime(data.pop("timestamp")).strftime(
    #                 "%Y/%m/%d %H:%M:%S"
    #             )
    #             sensor_name = data.pop("device_sensor__sensor__name")
    #             sensor_value = data.pop("value")
    #             data[sensor_name] = sensor_value
    #             sensors_data[iot_device_id].update(data)

    iot_device_list = list(iot_device_list)
    results = {}
    with connection.cursor() as cursor:
        raw_query = """
                    SELECT sd.iot_device_id, sd.timestamp, sd.value, s.name AS sensor_name
                    FROM iot.sensor_data_sensordata sd
                    JOIN (
                        SELECT iot_device_id, device_sensor_id, MAX(timestamp) AS max_timestamp
                        FROM iot.sensor_data_sensordata
                        WHERE iot_device_id IN %s
                        GROUP BY iot_device_id, device_sensor_id
                    ) AS max_timestamps
                    ON sd.iot_device_id = max_timestamps.iot_device_id
                        AND sd.device_sensor_id = max_timestamps.device_sensor_id
                        AND sd.timestamp = max_timestamps.max_timestamp
                    JOIN iot.iot_devices_iotdevicesensor ds ON sd.device_sensor_id = ds.id
                    JOIN iot.sensors_sensor s ON ds.sensor_id = s.id
                    WHERE sd.iot_device_id IN %s
                    ORDER BY ds.iot_device_id ASC,  ds.field_number ASC
                """
        cursor.execute(
            raw_query,
            [iot_device_list, iot_device_list],
        )
        results = dictfetchall(cursor)

    for data in results:
        iot_device_id = data.pop("iot_device_id")
        data["timestamp"] = timezone.localtime(
            data["timestamp"].replace(tzinfo=timezone.utc)
        ).strftime("%Y/%m/%d %H:%M:%S")
        sensor_name = data.pop("sensor_name")
        sensor_value = data.pop("value")
        data[sensor_name] = sensor_value
        sensors_data[iot_device_id].update(data)

    return Response(sensors_data, status=status.HTTP_200_OK)
