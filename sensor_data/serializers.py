from rest_framework import serializers
from iot_devices.models import IotDevice
from django.utils import timezone
from .models import CompanySensorData, AdminUserSensorData


class SensorDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanySensorData
        fields = [
            "company_sensor",
            "iot_device",
            "timestamp",
            "value",
        ]


class AdminSensorDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminUserSensorData
        fields = [
            "user_sensor",
            "iot_device",
            "timestamp",
            "value",
        ]


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
            raise serializers.ValidationError({"error": "Request data is empty"})
        attrs["timestamp"] = timezone.now()
        return attrs

    def create(self, validated_data):
        sensor_data = []
        company_sensors = self.context["company_sensors"]
        iot_device = self.context["iot_device"]
        for company_sensor in company_sensors:
            field_name = company_sensor.field_name
            if field_name in validated_data:
                sensor_data.append(
                    CompanySensorData(
                        company_sensor=company_sensor,
                        iot_device=iot_device,
                        value=validated_data[field_name],
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
        print("In serializer = ", attrs)
        if not attrs:
            raise serializers.ValidationError({"error": "Request data is empty"})
        attrs["timestamp"] = timezone.now()
        return attrs

    def create(self, validated_data):
        sensor_data = []
        admin_user_sensors = self.context["admin_user_sensors"]
        iot_device = self.context["iot_device"]
        for admin_user_sensor in admin_user_sensors:
            field_name = admin_user_sensor.field_name
            sensor_data.append(
                AdminUserSensorData(
                    user_sensor=admin_user_sensor,
                    iot_device=iot_device,
                    value=validated_data[field_name],
                    timestamp=validated_data["timestamp"],
                )
            )

        return AdminUserSensorData.objects.bulk_create(sensor_data)
