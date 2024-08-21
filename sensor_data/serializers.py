from django.utils import timezone
from rest_framework import serializers
from utils.error_message import ERROR_NO_VALUE
from .models import SensorData


class IotDeviceSensorDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = SensorData
        fields = [
            "device_sensor",
            "iot_device",
            "timestamp",
            "value",
        ]
        extra_kwargs = {
            "device_sensor": {"required": False},
            "iot_device": {"required": False},
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields.update(self.get_sensor_fields())

    def get_sensor_fields(self):
        fields = {}
        device_sensors = self.context["device_sensors"]

        for device_sensor in device_sensors:
            field_name = device_sensor.field_name
            if device_sensor.sensor.is_value_boolean:
                if field_name in self.initial_data:
                    # check to see if value is provided in initial data to avoid being field default o false
                    # default to none because if field is absent in request.data it will default to false which is not the required case
                    fields[field_name] = serializers.BooleanField(
                        required=False, default=None, allow_null=True
                    )
            else:
                fields[field_name] = serializers.FloatField(required=False)
        return fields

    def validate_sensor_data(self, attrs):
        """Removing the sensor data that beyond device sensor max and min limit"""
        device_sensors = self.context["device_sensors"]
        for device_sensor in device_sensors:
            field_name = device_sensor.field_name
            if field_name in attrs:
                value = attrs[field_name]
                if not device_sensor.sensor.is_value_boolean:
                    # getting min and max limit
                    min_limit = device_sensor.min_limit
                    max_limit = device_sensor.max_limit

                    # checking if values lies in the range or not
                    # if max_limit and value <= max_limit:
                    if (max_limit is not None and value > max_limit) or (
                        min_limit is not None and value < min_limit
                    ):
                        attrs.pop(field_name)
        return attrs

    def validate(self, attrs):
        if not attrs:
            raise serializers.ValidationError({"error": ERROR_NO_VALUE})
        attrs = self.validate_sensor_data(attrs)
        if not attrs:
            return attrs
        attrs["timestamp"] = timezone.now()
        return attrs

    def create(self, validated_data):
        sensor_data = []
        if not validated_data:
            return sensor_data
        device_sensors = self.context["device_sensors"]
        iot_device = self.context["iot_device"]
        for device_sensor in device_sensors:
            field_name = device_sensor.field_name
            if field_name in validated_data:
                sensor_data.append(
                    SensorData(
                        device_sensor=device_sensor,
                        iot_device=iot_device,
                        value=validated_data[field_name],
                        timestamp=validated_data["timestamp"],
                    )
                )

        return SensorData.objects.bulk_create(sensor_data)
