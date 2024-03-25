from asgiref.sync import async_to_sync
from celery import shared_task
from channels.layers import get_channel_layer
from iot_devices.cache import IotDeviceCache
from django.utils import timezone
from django.db.models import OuterRef, Subquery
from sensor_data.models import SensorData
from django.db import connection
import logging

import json
from collections import defaultdict

logger = logging.getLogger(__name__)


def dictfetchall(cursor):
    """
    Return all rows from a cursor as a dict.
    Assume the column names are unique.
    """
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]


# @shared_task
# def send_initial_data(username=None, company_slug=None):
#     """
#     Function to send data Initial data
#     Sends the latest data of each sensor per device for user or company
#     """
#     channel_layer = get_channel_layer()

#     # defining the group name for admin user or company
#     group_name = company_slug if company_slug else username
#     logger.warning(
#         f"inside SensorDataConsumer {company_slug if company_slug else username} get_initial_data method"
#     )
#     iot_device_list = []
#     if company_slug:
#         iot_device_list = IotDeviceCache.get_all_company_iot_devices(
#             company_slug=company_slug
#         )
#     else:
#         iot_device_list = IotDeviceCache.get_all_user_iot_devices(username=username)

#     # Use annotate to get the latest timestamp for each device_sensor
#     latest_timestamp_subquery = (
#         SensorData.objects.filter(device_sensor=OuterRef("device_sensor"))
#         .order_by("-timestamp")
#         .values("timestamp")[:1]
#     )
#     # Use these latest timestamps to filter the queryset
#     latest_sensor_data_qs = (
#         SensorData.objects.select_related("device_sensor", "iot_device")
#         .filter(iot_device__in=iot_device_list)
#         .filter(timestamp=Subquery(latest_timestamp_subquery))
#         .values(
#             "device_sensor__sensor__name",
#             "iot_device_id",
#             "value",
#             "timestamp",
#         )
#         .order_by("device_sensor__field_number")
#     )
#     logger.warning(
#         f"inside SensorDataConsumer {company_slug if company_slug else username} after query method"
#     )

#     sensors_data = defaultdict(dict)
#     for data in latest_sensor_data_qs:
#         iot_device_id = data.pop("iot_device_id")
#         data["timestamp"] = timezone.localtime(data.pop("timestamp")).strftime(
#             "%Y/%m/%d %H:%M:%S"
#         )
#         sensor_name = data.pop("device_sensor__sensor__name")
#         sensor_value = data.pop("value")
#         data[sensor_name] = sensor_value
#         sensors_data[iot_device_id].update(data)

#     logger.warning(
#         f"inside SensorDataConsumer {company_slug if company_slug else username} after executing query method"
#     )

#     # connects to the Consumers.py and calls send_data function in websocket app
#     async_to_sync(channel_layer.group_send)(
#         group_name,
#         {
#             "type": "send_initial_data",
#             "data": json.dumps(sensors_data),
#         },
#     )


@shared_task
def send_initial_data(username=None, company_slug=None):
    """
    Function to send data Initial data
    Sends the latest data of each sensor per device for user or company
    """
    channel_layer = get_channel_layer()

    # defining the group name for admin user or company
    group_name = company_slug if company_slug else username
    logger.warning(
        f"inside SensorDataConsumer {company_slug if company_slug else username} get_initial_data method"
    )
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
    if iot_device_list:
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

    logger.warning(
        f"inside SensorDataConsumer {company_slug if company_slug else username} after query method"
    )

    for data in results:
        iot_device_id = data.pop("iot_device_id")
        data["timestamp"] = timezone.localtime(
            data["timestamp"].replace(tzinfo=timezone.utc)
        ).strftime("%Y/%m/%d %H:%M:%S")
        sensor_name = data.pop("sensor_name")
        sensor_value = data.pop("value")
        data[sensor_name] = sensor_value
        sensors_data[iot_device_id].update(data)

    logger.warning(
        f"inside SensorDataConsumer {company_slug if company_slug else username} after executing query method"
    )

    # connects to the Consumers.py and calls send_data function in websocket app
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "send_initial_data",
            "data": json.dumps(sensors_data),
        },
    )
