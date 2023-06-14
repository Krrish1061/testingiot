from rest_framework import serializers
from .models import IotDevice, CompanySensor, Sensor, SensorData
from company.models import Company


class IotDeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = IotDevice
        fields = ["iot_device_id", "iot_device_location", "is_active"]
        read_only_fields = ["iot_device_id"]


class SensorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sensor
        fields = ["name", "value_type", "unit"]


class CompanySensorSerializer(serializers.Serializer):
    company = serializers.IntegerField()
    fieldname_sensor_dict = serializers.DictField(
        child=serializers.CharField(max_length=255)
    )

    def validate(self, attrs):
        sensor_name_list = set(self.context["sensor_name"])
        if set(attrs["fieldname_sensor_dict"].values()).issubset(sensor_name_list):
            return attrs
        else:
            raise serializers.ValidationError({"error": "Sensor does not exist"})

    def create(self, validated_data):
        try:
            company = Company.objects.get(pk=validated_data["company"])
        except Company.DoesNotExist:
            raise serializers.ValidationError({"error": "Company does not exist"})
        company_sensors = []
        for field_name, sensor_value in validated_data["fieldname_sensor_dict"].items():
            sensor_obj = Sensor.objects.get(name=sensor_value)
            company_sensor = CompanySensor(
                company=company,
                sensor=sensor_obj,
                field_name=field_name,
            )
            company_sensors.append(company_sensor)
        return CompanySensor.objects.bulk_create(company_sensors)


class SensorDataSerializer(serializers.Serializer):
    boardid = serializers.IntegerField()
    timestamp = serializers.DateTimeField()

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
                    choices=[(1, "ON"), (0, "OFF")]
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
            raise serializers.ValidationError({"error": "Device does not exist"})
        if user.company != iot_device.company:
            raise serializers.ValidationError({"error": "Invalid Iot device"})
        return attrs

    def create(self, validated_data):
        sensor_data = []
        company_sensors = self.context["company_sensors"]
        boardid = self.context["request"].POST.get("boardid")
        iot_device = IotDevice.objects.get(iot_device_id=boardid)
        for company_sensor in company_sensors:
            field_name = company_sensor.field_name
            sensor_data.append(
                SensorData(
                    company_sensor=company_sensor,
                    iot_device=iot_device,
                    company_id=company_sensor.company,
                    value=validated_data[field_name],
                    timestamp=validated_data.get("timestamp"),
                )
            )

        return SensorData.objects.bulk_create(sensor_data)
