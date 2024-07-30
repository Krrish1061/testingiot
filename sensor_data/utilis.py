from django.utils import timezone
import pandas as pd


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


def get_mains_interruption_count(sensor_data: list):
    """Returns the number of times Mains (power Supply) was cut-off"""
    if not sensor_data or len(sensor_data) == 1:
        return 0

    df = pd.DataFrame(sensor_data)

    # Shift the 'value' column to compare with the previous value
    df["previous_value"] = df["value"].shift(1)

    # Count transitions from 1 to 0
    interruptions = ((df["value"] == 0) & (df["previous_value"] == 1)).sum()

    # Account for the first value if it is 0
    if df.iloc[0]["value"] == 0:
        interruptions += 1

    # type casting is because of type <class 'numpy.int64'> which is unserializer
    return int(interruptions)
