from django.utils import timezone
from rest_framework import serializers
from utils.error_message import ERROR_NO_VALUE

from .models import AdminUserSensorData, CompanySensorData


class CompanySensorDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanySensorData
        fields = [
            "company_sensor",
            "iot_device",
            "timestamp",
            "value",
        ]
        extra_kwargs = {
            "company_sensor": {"required": False},
            "iot_device": {"required": False},
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields.update(self.get_sensor_fields())

    def get_sensor_fields(self):
        fields = {}
        company_sensors = self.context["company_sensors"]

        for company_sensor in company_sensors:
            field_name = company_sensor.field_name
            if company_sensor.sensor.name == "mains":
                fields[field_name] = serializers.ChoiceField(
                    choices=[(1, "ON"), (0, "OFF")], required=False
                )
            else:
                fields[field_name] = serializers.FloatField(required=False)
        return fields

    def validate(self, attrs):
        if not attrs:
            raise serializers.ValidationError({"error": ERROR_NO_VALUE})
        attrs["timestamp"] = timezone.now()
        return attrs

    def create(self, validated_data):
        sensor_data = []
        company_sensors = self.context["company_sensors"]
        iot_device = self.context["iot_device"]
        for company_sensor in company_sensors:
            field_name = company_sensor.field_name
            sensor = company_sensor.sensor
            value = min(
                max(
                    validated_data[field_name],
                    sensor.min_value if sensor.min_value else float("-inf"),
                ),
                sensor.max_value if sensor.max_value else float("inf"),
            )
            if field_name in validated_data:
                sensor_data.append(
                    CompanySensorData(
                        company_sensor=company_sensor,
                        iot_device=iot_device,
                        value=value,
                        timestamp=validated_data["timestamp"],
                    )
                )

        return CompanySensorData.objects.bulk_create(sensor_data)


class AdminUserSensorDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminUserSensorData
        fields = [
            "user_sensor",
            "iot_device",
            "timestamp",
            "value",
        ]
        extra_kwargs = {
            "user_sensor": {"required": False},
            "iot_device": {"required": False},
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields.update(self.get_sensor_fields())

    def get_sensor_fields(self):
        fields = {}
        admin_user_sensors = self.context["admin_user_sensors"]

        for admin_user_sensor in admin_user_sensors:
            field_name = admin_user_sensor.field_name
            if admin_user_sensor.sensor.name == "mains":
                fields[field_name] = serializers.ChoiceField(
                    choices=[(1, "ON"), (0, "OFF")], required=False
                )
            else:
                fields[field_name] = serializers.FloatField(required=False)
        return fields

    def validate(self, attrs):
        if not attrs:
            raise serializers.ValidationError({"error": ERROR_NO_VALUE})
        attrs["timestamp"] = timezone.now()
        return attrs

    def create(self, validated_data):
        sensor_data = []
        admin_user_sensors = self.context["admin_user_sensors"]
        iot_device = self.context["iot_device"]
        for admin_user_sensor in admin_user_sensors:
            field_name = admin_user_sensor.field_name
            # checking the min and max value
            sensor = admin_user_sensor.sensor
            value = min(
                max(
                    validated_data[field_name],
                    sensor.min_value if sensor.min_value else float("-inf"),
                ),
                sensor.max_value if sensor.max_value else float("inf"),
            )

            sensor_data.append(
                AdminUserSensorData(
                    user_sensor=admin_user_sensor,
                    iot_device=iot_device,
                    value=value,
                    timestamp=validated_data["timestamp"],
                )
            )

        return AdminUserSensorData.objects.bulk_create(sensor_data)
