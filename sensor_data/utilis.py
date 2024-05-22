from django.utils import timezone


def prepare_sensor_data(field_sensor_name_dict, data, iot_device_id, timestamp):
    """
    sensor data prepared in format
    {
        "sensor_name": sensor value,
        "sensor_name": sensor value,
        "iot_device_id": 6,
        "timestamp": %Y-%m-%d %H:%M:%S
    }

    """
    sensor_data = {
        sensor_name: data[field_name]
        for field_name, sensor_name in field_sensor_name_dict.items()
        if field_name in data
    }
    sensor_data["iot_device_id"] = iot_device_id
    localized_timestamp = timestamp.astimezone(timezone.get_default_timezone())
    formatted_timestamp = localized_timestamp.strftime("%Y-%m-%d %H:%M:%S")
    sensor_data["timestamp"] = formatted_timestamp
    return sensor_data


def strtobool(val):
    """Convert a string representation of truth to true (1) or false (0).
    True values are 'true', and '1';
    Everything else is false values.
    """
    val = val.lower()
    if val in ("1", "true"):
        return True
    return False
