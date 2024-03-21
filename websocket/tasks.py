from asgiref.sync import async_to_sync
from celery import shared_task
from channels.layers import get_channel_layer
from iot_devices.cache import IotDeviceCache
from django.utils import timezone
from django.db.models import OuterRef, Subquery
from sensor_data.models import SensorData
import logging
import json
from collections import defaultdict

logger = logging.getLogger(__name__)


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
    iot_device_list = []
    if company_slug:
        iot_device_list = IotDeviceCache.get_all_company_iot_devices(
            company_slug=company_slug
        )
    else:
        iot_device_list = IotDeviceCache.get_all_user_iot_devices(username=username)

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
        .order_by("device_sensor__field_number")
    )
    logger.warning(
        f"inside SensorDataConsumer {company_slug if company_slug else username} after query method"
    )

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
