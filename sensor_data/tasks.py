import gzip
import json
import sys
import zoneinfo
from datetime import datetime, timedelta

import requests
from asgiref.sync import async_to_sync
from celery import shared_task
from channels.layers import get_channel_layer
from django.db.models import CharField, DateTimeField, F, Func, Value
from django.utils.timezone import make_aware

from iot_devices.cache import IotDeviceCache
from send_livedata.cache import SendLiveDataCache
from sensor_data.models import SensorData


class ConvertTz(Func):
    function = "CONVERT_TZ"
    output_field = DateTimeField()


@shared_task
def send_live_data_to(username, company_slug, data, iot_device_id, board_id, timestamp):
    """Sending data to the third party api endpoint"""

    send_livedata_to = (
        SendLiveDataCache.get_send_livedata_by_user(username)
        if username
        else SendLiveDataCache.get_send_livedata_by_company(company_slug)
    )

    if send_livedata_to:
        url = send_livedata_to.endpoint
        if url:
            device_sensors = IotDeviceCache.get_all_device_sensors(iot_device_id)
            sensor_data = {
                device_sensor.sensor.name: (
                    int(data[device_sensor.field_name])
                    if device_sensor.sensor.is_value_boolean
                    else data[device_sensor.field_name]
                )
                for device_sensor in device_sensors
                if (
                    device_sensor.field_name in data
                    and (
                        device_sensor.max_limit is None
                        or data[device_sensor.field_name] <= device_sensor.max_limit
                    )
                    and (
                        device_sensor.min_limit is None
                        or data[device_sensor.field_name] >= device_sensor.min_limit
                    )
                )
            }

            sensor_data["timestamp"] = timestamp
            if send_livedata_to.send_device_board_id:
                sensor_data["timestamp"] = board_id
            try:
                requests.post(url=url, json=sensor_data)
            except Exception:
                pass


@shared_task
def get_sensor_data(sensor_name, iot_device_id, channel_name, start_date, end_date):
    """Used For Fetching data of a specific sensor of a iot device and send data via websocket for graphical representation"""
    kathmandu_tz = zoneinfo.ZoneInfo("Asia/Kathmandu")

    try:
        start_date = datetime.strptime(start_date, "%Y-%m-%d")
        end_date = datetime.strptime(end_date, "%Y-%m-%d").replace(
            hour=23, minute=59, second=59, microsecond=999999
        )
    except ValueError:
        start_date = (datetime.now() - timedelta(days=1)).date()
        end_date = datetime.now()

    start_date = make_aware(start_date, kathmandu_tz)
    end_date = make_aware(end_date, kathmandu_tz)

    sensor_data_qs = (
        SensorData.objects.filter(
            iot_device__id=iot_device_id,
            timestamp__range=(start_date, end_date),
            device_sensor__sensor__name=sensor_name,
        )
        .annotate(
            date_time=Func(
                ConvertTz(F("timestamp"), Value("UTC"), Value(kathmandu_tz)),
                Value("%Y/%m/%d %H:%i:%s"),
                function="DATE_FORMAT",
                output_field=CharField(),
            ),
        )
        .values("value", "date_time")
        .order_by("timestamp")
    )

    sensor_data = list(sensor_data_qs)
    channel_layer = get_channel_layer()

    data = json.dumps(
        [
            {
                "message_type": "sensor_data",
                "sensor_name": sensor_name,
                "iot_device_id": iot_device_id,
            },
            sensor_data,
        ]
    )

    # Convert 1MB to bytes
    ONE_MB = 1024 * 1024
    if sys.getsizeof(data) < ONE_MB:
        async_to_sync(channel_layer.send)(
            channel_name, {"type": "send_data", "data": data}
        )
    else:
        compressed_data = gzip.compress(data.encode("utf-8"))
        async_to_sync(channel_layer.send)(
            channel_name, {"type": "send_binary_data", "data": compressed_data}
        )
