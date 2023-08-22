from rest_framework import serializers
from company.models import Company
from users.models import AdminUser
from .models import Sensor, CompanySensor, AdminUserSensor


class SensorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sensor
        fields = ["name", "value_type", "unit", "symbol"]


class CompanySensorSerializer(serializers.ModelSerializer):
    fieldname_sensor_dict = serializers.DictField(
        child=serializers.CharField(max_length=255), write_only=True
    )
    sensor_name = serializers.SerializerMethodField()
    update_field_name = serializers.CharField(
        max_length=255, write_only=True, required=False
    )

    def get_sensor_name(self, obj):
        return obj.sensor.name if obj.sensor else None

    class Meta:
        model = CompanySensor
        fields = [
            "id",
            "sensor_name",
            "company_id",
            "field_name",
            "fieldname_sensor_dict",
            "update_field_name",
        ]
        read_only_fields = ("sensor_name", "company_id", "field_name")
        extra_kwargs = {"company_id": {"source": "company"}}

    def validate(self, attrs):
        request = self.context["request"]
        sensor_name_list = set(self.context["sensor_name"])

        company_id = self.context["company_id"]

        try:
            company = Company.objects.get(pk=company_id)
            attrs["company"] = company
        except Company.DoesNotExist:
            raise serializers.ValidationError({"error": "Company does not exist"})

        company_sensor = CompanySensor.objects.filter(company=company_id).values_list(
            "sensor__name", "field_name"
        )

        if request.method == "POST":
            if "fieldname_sensor_dict" not in attrs:
                raise serializers.ValidationError({"error": "No value is provided"})

            if not set(attrs["fieldname_sensor_dict"].values()).issubset(
                sensor_name_list
            ):
                raise serializers.ValidationError({"error": "Sensor does not exist"})

            for field_name, sensor_name in attrs["fieldname_sensor_dict"].items():
                for sensor_tuple in company_sensor:
                    sensorname, fieldname = sensor_tuple
                    if sensorname == sensor_name:
                        raise serializers.ValidationError(
                            {
                                "error": f"Sensor {sensorname} is already assign to {fieldname}"
                            }
                        )
                    if fieldname == field_name:
                        raise serializers.ValidationError(
                            {
                                "error": f"{fieldname} is already assign to Sensor {sensorname}"
                            }
                        )
        elif request.method == "PATCH":
            if "update_field_name" not in attrs:
                raise serializers.ValidationError(
                    {"error": "No value is provided for the field_name"}
                )

            field_name = attrs["update_field_name"]
            for sensor_tuple in company_sensor:
                sensorname, fieldname = sensor_tuple

                if fieldname == field_name:
                    raise serializers.ValidationError(
                        {
                            "error": f"{fieldname} is already assign to Sensor {sensorname}"
                        }
                    )

        return attrs

    def update(self, instance, validated_data):
        field_name = validated_data["update_field_name"]
        instance.field_name = field_name
        instance.save()
        return instance

    def create(self, validated_data):
        company_sensors = []
        for field_name, sensor_name in validated_data["fieldname_sensor_dict"].items():
            sensor_obj = Sensor.objects.get(name=sensor_name)
            company_sensor = CompanySensor(
                company=validated_data["company"],
                sensor=sensor_obj,
                field_name=field_name,
            )
            company_sensors.append(company_sensor)
        return CompanySensor.objects.bulk_create(company_sensors)


class AdminUserSensorSerializer(serializers.ModelSerializer):
    fieldname_sensor_dict = serializers.DictField(
        child=serializers.CharField(max_length=255), write_only=True
    )
    sensor_name = serializers.SerializerMethodField()
    update_field_name = serializers.CharField(
        max_length=255, write_only=True, required=False
    )

    def get_sensor_name(self, obj):
        return obj.sensor.name if obj.sensor else None

    class Meta:
        model = AdminUserSensor
        fields = [
            "id",
            "sensor_name",
            "user_id",
            "field_name",
            "fieldname_sensor_dict",
            "update_field_name",
        ]
        read_only_fields = ("sensor_name", "user_id", "field_name")
        extra_kwargs = {"user_id": {"source": "user"}}

    def validate(self, attrs):
        request = self.context["request"]
        sensor_name_list = set(self.context["sensor_name"])

        admin_user_id = self.context["admin_user_id"]
        try:
            admin_user = AdminUser.objects.get(pk=admin_user_id)
            attrs["user"] = admin_user
        except AdminUser.DoesNotExist:
            raise serializers.ValidationError({"error": "Admin User does not exist"})

        if admin_user.is_associated_with_company:
            raise serializers.ValidationError(
                {"error": "Admin User should not be associate with any Company"}
            )

        admin_user_sensor = AdminUserSensor.objects.filter(
            user=admin_user_id
        ).values_list("sensor__name", "field_name")

        if request.method == "POST":
            if "fieldname_sensor_dict" not in attrs:
                raise serializers.ValidationError({"error": "No value is provided"})

            if not set(attrs["fieldname_sensor_dict"].values()).issubset(
                sensor_name_list
            ):
                raise serializers.ValidationError({"error": "Sensor does not exist"})

            for field_name, sensor_name in attrs["fieldname_sensor_dict"].items():
                for sensor_tuple in admin_user_sensor:
                    sensorname, fieldname = sensor_tuple
                    if sensorname == sensor_name:
                        raise serializers.ValidationError(
                            {
                                "error": f"Sensor {sensorname} is already assign to {fieldname}"
                            }
                        )
                    if fieldname == field_name:
                        raise serializers.ValidationError(
                            {
                                "error": f"{fieldname} is already assign to Sensor {sensorname}"
                            }
                        )
        elif request.method == "PATCH":
            if "update_field_name" not in attrs:
                raise serializers.ValidationError(
                    {"error": "No value is provided for the field_name"}
                )

            field_name = attrs["update_field_name"]
            for sensor_tuple in admin_user_sensor:
                sensorname, fieldname = sensor_tuple

                if fieldname == field_name:
                    raise serializers.ValidationError(
                        {
                            "error": f"{fieldname} is already assign to Sensor {sensorname}"
                        }
                    )

        return attrs

    def update(self, instance, validated_data):
        field_name = validated_data["update_field_name"]
        instance.field_name = field_name
        instance.save()
        return instance

    def create(self, validated_data):
        admin_user_sensors = []
        for field_name, sensor_name in validated_data["fieldname_sensor_dict"].items():
            sensor_obj = Sensor.objects.get(name=sensor_name)
            company_sensor = AdminUserSensor(
                user=validated_data["user"],
                sensor=sensor_obj,
                field_name=field_name,
            )
            admin_user_sensors.append(company_sensor)
        return AdminUserSensor.objects.bulk_create(admin_user_sensors)
