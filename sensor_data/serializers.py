from rest_framework import serializers
from .models import IotDevice, AdminSensor, Sensor, SensorData
from users.models import AdminUser


class IotDeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = IotDevice
        fields = ["iot_device_id", "iot_device_location", "is_active"]
        read_only_fields = ["iot_device_id"]


class SensorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sensor
        fields = ["name", "value_type", "unit"]


class SensorDataSerializer(serializers.ModelSerializer):
    boardid = serializers.IntegerField()
    timestamp = serializers.DateTimeField()

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
                    choices=[(1, "On"), (0, "Off")]
                )
            else:
                fields[field_name] = serializers.FloatField()
        return fields

    def validate(self, attrs):
        boardid = self.context["request"].POST.get("boardid")
        user = self.context["request"].user
        try:
            iot_device = IotDevice.objects.get(iot_device_id=boardid)
        except IotDevice.DoesNotExist:
            raise serializers.ValidationError({"message": "Device does not exist"})
        if user != iot_device.user:
            raise serializers.ValidationError({"message": "Invalid Iot device"})
        return attrs

    def create(self, validated_data):
        sensor_data = []
        admin_user_sensors = self.context["admin_user_sensors"]
        boardid = self.context["request"].POST.get("boardid")
        iot_device = IotDevice.objects.get(iot_device_id=boardid)
        for admin_user_sensor in admin_user_sensors:
            field_name = admin_user_sensor.field_name
            sensor_data.append(
                SensorData(
                    admin_user_sensor=admin_user_sensor,
                    iot_device=iot_device,
                    admin_user_id=admin_user_sensor.user,
                    value=validated_data[field_name],
                    timestamp=validated_data.get("timestamp"),
                )
            )

        return SensorData.objects.bulk_create(sensor_data)


class SensorDataGetSerializer(serializers.ModelSerializer):
    class Meta:
        model = SensorData
        fields = ["iot_device_id", "value", "timestamp"]


class AdminUserSensorSerializer(serializers.ModelSerializer):
    sensor = SensorSerializer()
    sensor_data = SensorDataGetSerializer(source="admin_data_list", many=True)

    class Meta:
        model = AdminSensor
        fields = ["sensor", "sensor_data"]


class AdminSerializer(serializers.ModelSerializer):
    user_type = serializers.CharField(max_length=255, source="type", read_only=True)
    iot_device = IotDeviceSerializer(
        source="iot_device_list", many=True, read_only=True
    )
    sensor_data = AdminUserSensorSerializer(
        source="sensor_list", many=True, read_only=True
    )

    class Meta:
        model = AdminUser
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "user_type",
            "iot_device",
            "sensor_data",
        ]
