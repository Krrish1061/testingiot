import re

from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers

from company.models import Company
from dealer.models import Dealer
from iot_devices.cache import IotDeviceCache
from utils.error_message import (
    ERROR_ADMIN_USER_ASSOCIATED_WITH_COMPANY,
    ERROR_ADMIN_USER_NOT_FOUND,
    ERROR_COMPANY_NOT_FOUND,
    ERROR_DEVICE_NO_VALID_ASSOCIATION,
    ERROR_INVALID_FIELD_NAME,
    empty_dict,
    error_assigned_sensor,
)

from .models import IotDevice, IotDeviceDetail, IotDeviceSensor

User = get_user_model()


class IotDeviceDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = IotDeviceDetail
        fields = [
            "name",
            "environment_type",
            "description",
            "address",
        ]
        extra_kwargs = {
            "name": {"required": True},
        }

    def validate_name(self, value):
        if not value:
            raise serializers.ValidationError("Name field is required.")
        return value

    def update(self, instance, validated_data):
        # Update only the fields that are present in validated_data
        for field in self.Meta.fields:
            if field in validated_data:
                setattr(instance, field, validated_data[field])

        # Save the updated instance
        instance.save()
        return instance


class IotDeviceSerializer(serializers.ModelSerializer):
    iot_device_details = IotDeviceDetailSerializer(read_only=True)
    sensor_name_list = serializers.SerializerMethodField(read_only=True)
    user = serializers.SlugRelatedField(
        queryset=User.objects.all(),
        slug_field="username",
        allow_null=True,
        required=False,
    )
    company = serializers.SlugRelatedField(
        queryset=Company.objects.all(),
        slug_field="slug",
        allow_null=True,
        required=False,
    )
    dealer = serializers.SlugRelatedField(
        queryset=Dealer.objects.all(),
        slug_field="slug",
        allow_null=True,
        required=False,
    )

    class Meta:
        model = IotDevice
        fields = [
            "id",
            "user",
            "company",
            "dealer",
            "is_active",
            "board_id",
            "created_at",
            "iot_device_details",
            "sensor_name_list",
        ]

        read_only_fields = ("created_at",)
        extra_kwargs = {
            "is_active": {"default": True},
            "company": {
                "error_messages": {"does_not_exist": ERROR_COMPANY_NOT_FOUND},
            },
            "user": {
                "error_messages": {"does_not_exist": ERROR_ADMIN_USER_NOT_FOUND},
            },
        }

    def get_sensor_name_list(self, obj):
        device_sensors = IotDeviceCache.get_all_device_sensors(obj.id)
        return [device_sensor.sensor.name for device_sensor in device_sensors]

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        user = instance.user
        company = instance.company
        dealer = instance.dealer

        if user:
            representation.pop("company")
        if company:
            representation.pop("user")
        if not dealer:
            representation.pop("dealer")

        return representation

    def validate(self, attrs):
        user = attrs.get("user")
        company = attrs.get("company")
        dealer = attrs.get("dealer")
        request = self.context["request"]

        if user and user.is_associated_with_company:
            raise serializers.ValidationError(
                {"errors": ERROR_ADMIN_USER_ASSOCIATED_WITH_COMPANY}
            )

        if user and company:
            raise serializers.ValidationError(
                {"errors": ERROR_DEVICE_NO_VALID_ASSOCIATION}
            )

        if request.method == "POST":
            if not user and not company and not dealer:
                raise serializers.ValidationError(
                    {"errors": ERROR_DEVICE_NO_VALID_ASSOCIATION}
                )

        elif request.method == "PATCH":
            # is_dealer_user = self.context.get("is_dealer_user", False)
            is_super_admin_user = self.context.get("is_super_admin_user", False)
            instance = self.instance

            if is_super_admin_user:
                if (
                    (
                        "user" in attrs
                        and user is None
                        and instance.company is None
                        and company is None
                        and instance.dealer is None
                        and dealer is None
                    )
                    or (
                        "company" in attrs
                        and company is None
                        and instance.user is None
                        and user is None
                        and instance.dealer is None
                        and dealer is None
                    )
                    or (
                        "dealer" in attrs
                        and dealer is None
                        and instance.user is None
                        and user is None
                        and instance.company is None
                        and company is None
                    )
                ):
                    raise serializers.ValidationError(
                        {"errors": f"{ERROR_DEVICE_NO_VALID_ASSOCIATION}"}
                    )

            else:
                # user is a dealer
                requested_user = self.context["requested_user"]
                if instance.dealer != requested_user.dealer:
                    raise serializers.ValidationError(
                        {
                            "errors": "Permission Denied! you cannot update this iotDevice"
                        }
                    )

                if (
                    "user" in attrs
                    and user is None
                    and instance.company is None
                    and company is None
                ) or (
                    "company" in attrs
                    and company is None
                    and instance.user is None
                    and user is None
                ):
                    raise serializers.ValidationError(
                        {"errors": f"{ERROR_DEVICE_NO_VALID_ASSOCIATION}"}
                    )

                if (user and requested_user.dealer != user.dealer) or (
                    company and requested_user.dealer != company.dealer
                ):
                    raise serializers.ValidationError(
                        {
                            "errors": "Permission Denied! you cannot update this iotDevice"
                        }
                    )

        return attrs

    def update(self, instance, validated_data):
        user = validated_data.get("user", None)
        company = validated_data.get("company", None)
        is_super_admin_user = self.context["is_super_admin_user"]
        if instance.user != user or instance.company != company:
            instance.user = user
            instance.company = company
        if is_super_admin_user:
            is_active = validated_data.get("is_active", None)
            board_id = validated_data.get("board_id", None)
            dealer = validated_data.get("dealer", None)
            if is_active is not None and instance.is_active != is_active:
                instance.is_active = is_active
            if board_id is not None and instance.board_id != board_id:
                instance.board_id = board_id
            if instance.dealer != dealer:
                instance.dealer = dealer

        instance.save()
        return instance


class SensorSerializer(serializers.Serializer):
    sensor_name = serializers.CharField(max_length=255, required=True)
    max_limit = serializers.IntegerField(required=False, allow_null=True)
    min_limit = serializers.IntegerField(required=False, allow_null=True)

    def to_internal_value(self, data):
        if not data.get("sensor_name"):
            raise serializers.ValidationError(
                {"sensor_name": ["sensor name is not provided"]}
            )
        data["sensor_name"] = data.get("sensor_name").lower()
        return super().to_internal_value(data)


class IotDeviceSensorSerializer(serializers.ModelSerializer):
    # format fieldname_sensor={"field1": {"sensor_name": "value", "max_limit": "value", "min_limit": "value"}}
    fieldname_sensor = serializers.DictField(
        child=SensorSerializer(), write_only=True, required=False
    )
    sensor_name = serializers.SerializerMethodField()
    update_fieldname_sensor = serializers.DictField(
        child=SensorSerializer(), write_only=True, required=False
    )

    def get_sensor_name(self, obj):
        return obj.sensor.name if obj.sensor else None

    class Meta:
        model = IotDeviceSensor
        fields = [
            "id",
            "sensor_name",
            "iot_device",
            "field_name",
            "max_limit",
            "min_limit",
            "created_at",
            "fieldname_sensor",
            "update_fieldname_sensor",
        ]
        read_only_fields = (
            "id",
            "sensor_name",
            "iot_device",
            "field_name",
            "max_limit",
            "min_limit",
            "created_at",
        )

    def check_empty_dict(self, dict, name):
        if not bool(dict):
            raise serializers.ValidationError({"errors": empty_dict(name)})

    def check_dict_keys_pattern(self, keys):
        pattern = re.compile(r"^field\d+$")
        if not all(pattern.match(key) for key in keys):
            raise serializers.ValidationError({"errors": ERROR_INVALID_FIELD_NAME})

    def validate_fieldname_sensor(self, value):
        self.check_dict_keys_pattern(value.keys())
        return value

    def validate_update_fieldname_sensor(self, value):
        self.check_dict_keys_pattern(value.keys())
        return value

    def sensor_name_list(self, dict: dict) -> list[str]:
        dict_values = [x.get("sensor_name") for x in dict.values()]
        return dict_values

    def check_unique_value_list(self, sensor_name_list: list):
        # checking sensor_name in the list are unique or not
        # simply for avoiding going through the for loop if the dictionary doesn't contains duplicate value
        if len(sensor_name_list) != len(set(sensor_name_list)):
            seen_name = set()
            for sensor_name in sensor_name_list:
                if sensor_name in seen_name or seen_name.add(sensor_name):
                    raise serializers.ValidationError(
                        {
                            "errors": f"Sensor '{sensor_name}' is assigned to two different fields"
                        }
                    )

    def sensor_name_list_validation(self, dict: dict):
        sensor_name_list = self.sensor_name_list(dict)
        self.check_unique_value_list(sensor_name_list)

        # geting all the sensors name in the system
        sensors_list = self.context["sensor_list"]
        sensor_name_set = {sensor.name for sensor in sensors_list}

        # checking if sensor name provided in fieldname_sensor_dict exists in the system or not.
        if not set(sensor_name_list).issubset(sensor_name_set):
            raise serializers.ValidationError(
                {"errors": "A sensor is provided which is not in our system"}
            )

    def validate(self, attrs):
        request = self.context["request"]
        devices_sensors = self.context["device_sensors"]

        if request.method == "POST":
            self.check_empty_dict(
                dict=attrs.get("fieldname_sensor"), name="fieldname_sensor"
            )
            self.sensor_name_list_validation(attrs.get("fieldname_sensor"))

            # checking if provided field_name and sensor are already present in the iot device
            if devices_sensors:
                for field_name, sensor_dict in attrs["fieldname_sensor"].items():
                    for iot_device_sensor in devices_sensors:
                        sensorname = iot_device_sensor.sensor.name
                        fieldname = iot_device_sensor.field_name
                        if (sensorname == sensor_dict.get("sensor_name")) or (
                            fieldname == field_name
                        ):
                            raise serializers.ValidationError(
                                {"errors": error_assigned_sensor(sensorname, fieldname)}
                            )

        elif request.method == "PATCH":
            update_fieldname_sensor_dict = attrs.get("update_fieldname_sensor")
            self.check_empty_dict(
                dict=update_fieldname_sensor_dict,
                name="update_fieldname_sensor",
            )
            self.sensor_name_list_validation(update_fieldname_sensor_dict)

            # creating a dictionary of fieldname and sensor name for the provided iot device
            device_fieldname_sensor_dict = {
                device_sensor.field_name: device_sensor.sensor.name
                for device_sensor in devices_sensors
            }

            # adding value provided in update_fieldname_sensor_dict to fieldname_sensor_dict
            for field_name, sensor_dict in update_fieldname_sensor_dict.items():
                device_fieldname_sensor_dict[field_name] = sensor_dict.get(
                    "sensor_name"
                )

            # checking after updating if there are same sensor assigned to two different field
            sensor_name_list = list(device_fieldname_sensor_dict.values())
            self.check_unique_value_list(sensor_name_list)

        return attrs

    def get_sensor_object(self, sensor_name):
        sensor_obj = next(
            sensor
            for sensor in self.context["sensor_list"]
            if sensor.name == sensor_name
        )
        return sensor_obj

    def update_in_bulk(self, validated_data):
        device_sensors = self.context["device_sensors"]
        iot_device = self.context["iot_device"]
        update_fieldname_sensor_dict = validated_data.get("update_fieldname_sensor")

        # list of sensor associated with the device
        device_sensor_name_list = [
            device_sensor.sensor.name for device_sensor in device_sensors
        ]

        # list that stores actual updated instances
        devices_sensors_updated_list = []

        # list that stores devices sensor instance that need to be set sensor field null to avoid database integrity problem
        null_list_for_update = []

        # updating the value of each iotdevicesensor instance
        for field_name, sensor_dict in update_fieldname_sensor_dict.items():
            # using generator and checking field_name is in the device_sensor for updating it
            device_sensor = next(
                (ds for ds in device_sensors if ds.field_name == field_name), None
            )

            if device_sensor:
                sensor_name = sensor_dict.get("sensor_name")
                # if field_name is assigned to different sensor
                if device_sensor.sensor.name != sensor_name:
                    # adding only those sensor to the list that already exist in the device sensor lsit
                    if sensor_name in device_sensor_name_list:
                        null_list_for_update.append(
                            IotDeviceSensor(
                                pk=device_sensor.pk,
                                sensor=None,
                                iot_device=iot_device,
                            )
                        )

                    # getting the sensor object
                    sensor_obj = self.get_sensor_object(sensor_name)
                    device_sensor.sensor = sensor_obj

                # updating max and min limit
                device_sensor.max_limit = sensor_dict.get(
                    "max_limit", device_sensor.max_limit
                )
                device_sensor.min_limit = sensor_dict.get(
                    "min_limit", device_sensor.min_limit
                )

                devices_sensors_updated_list.append(device_sensor)

        with transaction.atomic():
            # Updating the all devicesensor instance and performing the database operation
            # to avoid database integrityError first setting sensor value to none and only then after updating
            if null_list_for_update:
                IotDeviceSensor.objects.bulk_update(null_list_for_update, ["sensor"])
            IotDeviceSensor.objects.bulk_update(
                devices_sensors_updated_list, ["sensor", "max_limit", "min_limit"]
            )
        return devices_sensors_updated_list

    def create(self, validated_data):
        device_sensors = []
        for field_name, sensor_dict in validated_data["fieldname_sensor"].items():
            # getting the sensor obj
            sensor_obj = self.get_sensor_object(sensor_dict.get("sensor_name"))

            # if there is no value provided sensor value is used
            max_limit = sensor_dict.get("max_limit", sensor_obj.max_limit)
            min_limit = sensor_dict.get("min_limit", sensor_obj.min_limit)

            device_sensor = IotDeviceSensor(
                iot_device=self.context["iot_device"],
                sensor=sensor_obj,
                field_name=field_name,
                field_number=int(field_name[5:]),
                max_limit=max_limit,
                min_limit=min_limit,
            )
            device_sensors.append(device_sensor)
        return IotDeviceSensor.objects.bulk_create(device_sensors)
