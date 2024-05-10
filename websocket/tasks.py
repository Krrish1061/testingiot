import json
from collections import defaultdict

from asgiref.sync import async_to_sync
from celery import shared_task
from channels.layers import get_channel_layer
from django.db import connection
from django.utils import timezone

from iot_devices.cache import IotDeviceCache


def dictfetchall(cursor):
    """
    Return all rows from a cursor as a dict.
    Assume the column names are unique.
    """
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]


@shared_task
def send_initial_data(username=None, company_slug=None):
    """
    Function to send data Initial data
    Sends the latest data of each sensor per device for user or company
    """
    channel_layer = get_channel_layer()

    # defining the group name for admin user or company
    group_name = company_slug if company_slug else username

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
                        FROM thoploiot.sensor_data_sensordata sd
                        JOIN (
                            SELECT iot_device_id, device_sensor_id, MAX(timestamp) AS max_timestamp
                            FROM thoploiot.sensor_data_sensordata
                            WHERE iot_device_id IN %s
                            GROUP BY iot_device_id, device_sensor_id
                        ) AS max_timestamps
                        ON sd.iot_device_id = max_timestamps.iot_device_id
                            AND sd.device_sensor_id = max_timestamps.device_sensor_id
                            AND sd.timestamp = max_timestamps.max_timestamp
                        JOIN thoploiot.iot_devices_iotdevicesensor ds ON sd.device_sensor_id = ds.id
                        JOIN thoploiot.sensors_sensor s ON ds.sensor_id = s.id
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

    # connects to the Consumers.py and calls send_data function in websocket app
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "send_data",
            "data": json.dumps([{"message_type": "initial_data"}, sensors_data]),
        },
    )
