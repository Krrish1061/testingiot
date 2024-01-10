from rest_framework import serializers
from caching.cache import Cache
from company.models import Company
from users.models import User
from utils.constants import UserType
from utils.error_message import (
    ERROR_ADMIN_USER_ASSOCIATED_WITH_COMPANY,
    ERROR_ADMIN_USER_NOT_FOUND,
    ERROR_COMPANY_NOT_FOUND,
    ERROR_EMPTY_ADMIN_USER_SENSOR_LIST,
    ERROR_EMPTY_COMPANY_SENSOR_LIST,
    ERROR_EMPTY_DICT,
    ERROR_ONLY_ADMIN_USER_PERMITTED,
    ERROR_SENSOR_NOT_FOUND,
    ERROR_UPDATE_NO_FIELD_NAME,
    error_assigned_sensor,
)
from caching.cache_key import (
    ADMIN_USER_SENSOR_APP_NAME,
    COMPANY_LIST_CACHE_KEY,
    COMPANY_LIST_CACHE_KEY_APP_NAME,
    COMPANY_SENSOR_APP_NAME,
    USER_LIST_CACHE_KEY,
    USER_LIST_CACHE_KEY_APP_NAME,
    get_admin_user_sensor_cache_key,
    get_company_sensor_cache_key,
)
from .models import Sensor, CompanySensor, AdminUserSensor


class SensorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sensor
        fields = [
            "id",
            "name",
            "unit",
            "symbol",
            "created_at",
            "max_value",
            "min_value",
        ]

        read_only_fields = ("id", "created_at")


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
            "company",
            "field_name",
            "fieldname_sensor_dict",
            "update_field_name",
        ]
        read_only_fields = ("sensor_name", "company", "field_name")

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["company"] = instance.company.slug
        return representation

    def get_company(self, company_slug):
        company = Cache.get_company_by_slug(COMPANY_LIST_CACHE_KEY, company_slug)
        if not company:
            try:
                company = Company.objects.select_related("profile").get(
                    slug=company_slug
                )
                Cache.set_to_list(
                    cache_key=COMPANY_LIST_CACHE_KEY,
                    app_name=COMPANY_LIST_CACHE_KEY_APP_NAME,
                    data=company,
                )
            except Company.DoesNotExist:
                return None
        return company

    def get_company_sensors_list(self, company_slug):
        cache_key = get_company_sensor_cache_key(company_slug)
        company_sensors = Cache.get_all(
            cache_key=cache_key,
            app_name=COMPANY_SENSOR_APP_NAME,
        )
        if company_sensors is None:
            company_sensors = CompanySensor.objects.select_related(
                "sensor", "company"
            ).filter(company__slug=company_slug)
            Cache.set_all(
                cache_key=cache_key,
                app_name=COMPANY_SENSOR_APP_NAME,
                data=company_sensors,
            )

        return company_sensors if company_sensors else None

    def validate(self, attrs):
        request = self.context["request"]
        company_sensors_list = self.get_company_sensors_list(
            self.context["company_slug"]
        )

        # if there is no sensor associated with the company
        if company_sensors_list is None:
            raise serializers.ValidationError(
                {"error": ERROR_EMPTY_COMPANY_SENSOR_LIST}
            )

        company_sensors = [
            (company_sensor.sensor.name, company_sensor.field_name)
            for company_sensor in company_sensors_list
        ]

        if request.method == "POST":
            if not bool(attrs.get("fieldname_sensor_dict")):
                raise serializers.ValidationError({"error": ERROR_EMPTY_DICT})

            company = self.get_company(self.context["company_slug"])
            if Company is None:
                raise serializers.ValidationError({"error": ERROR_COMPANY_NOT_FOUND})
            attrs["company"] = company

            sensor_name_set = {sensor.name for sensor in self.context["sensor_list"]}

            if not set(attrs["fieldname_sensor_dict"].values()).issubset(
                sensor_name_set
            ):
                raise serializers.ValidationError({"error": ERROR_SENSOR_NOT_FOUND})

            for field_name, sensor_name in attrs["fieldname_sensor_dict"].items():
                for sensor_tuple in company_sensors:
                    sensorname, fieldname = sensor_tuple
                    if (sensorname == sensor_name) or (fieldname == field_name):
                        raise serializers.ValidationError(
                            {"error": error_assigned_sensor(sensorname, fieldname)}
                        )

        elif request.method == "PATCH":
            if "update_field_name" not in attrs:
                raise serializers.ValidationError({"error": ERROR_UPDATE_NO_FIELD_NAME})

            field_name = attrs["update_field_name"]
            for sensor_tuple in company_sensors:
                sensorname, fieldname = sensor_tuple
                if fieldname == field_name:
                    raise serializers.ValidationError(
                        {"error": error_assigned_sensor(sensorname, fieldname)}
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
            sensor_obj = next(
                sensor
                for sensor in self.context["sensor_list"]
                if sensor.name == sensor_name
            )
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
            "user",
            "field_name",
            "fieldname_sensor_dict",
            "update_field_name",
        ]
        read_only_fields = ("sensor_name", "user_id", "field_name")
        # extra_kwargs = {"user_id": {"source": "user"}}

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["user"] = instance.user.username
        return representation

    def get_user(self, username):
        admin_user = Cache.get_user_by_username(USER_LIST_CACHE_KEY, username)
        if not admin_user:
            try:
                admin_user = User.objects.select_related(
                    "company", "user_extra_field"
                ).get(username=username)
                Cache.set_to_list(
                    cache_key=USER_LIST_CACHE_KEY,
                    app_name=USER_LIST_CACHE_KEY_APP_NAME,
                    data=admin_user,
                )
            except User.DoesNotExist:
                return None
        return admin_user

    def get_admin_user_sensors_list(self, username):
        cache_key = get_admin_user_sensor_cache_key(username)
        admin_user_sensors = Cache.get_all(
            cache_key=cache_key,
            app_name=ADMIN_USER_SENSOR_APP_NAME,
        )
        if admin_user_sensors is None:
            admin_user_sensors = AdminUserSensor.objects.select_related(
                "sensor", "company"
            ).filter(user__username=username)

            Cache.set_all(
                cache_key=cache_key,
                app_name=ADMIN_USER_SENSOR_APP_NAME,
                data=admin_user_sensors,
            )

        return admin_user_sensors if admin_user_sensors else None

    def validate(self, attrs):
        request = self.context["request"]
        admin_user_sensor_list = self.get_admin_user_sensors_list(
            self.context["admin_user_username"]
        )
        # if there is no sensor associated with the admin user
        if admin_user_sensor_list is None:
            raise serializers.ValidationError(
                {"error": ERROR_EMPTY_ADMIN_USER_SENSOR_LIST}
            )

        admin_user_sensors = [
            (admin_user_sensor.sensor.name, admin_user_sensor.field_name)
            for admin_user_sensor in admin_user_sensor_list
        ]

        if request.method == "POST":
            if not bool(attrs.get("fieldname_sensor_dict")):
                raise serializers.ValidationError({"error": ERROR_EMPTY_DICT})

            admin_user = self.get_user(self.context["admin_user_username"])
            if admin_user is None:
                raise serializers.ValidationError({"error": ERROR_ADMIN_USER_NOT_FOUND})

            if admin_user.type != UserType.ADMIN:
                raise serializers.ValidationError(
                    {"error": ERROR_ONLY_ADMIN_USER_PERMITTED}
                )

            if admin_user.is_associated_with_company:
                raise serializers.ValidationError(
                    {"error": ERROR_ADMIN_USER_ASSOCIATED_WITH_COMPANY}
                )

            attrs["user"] = admin_user

            sensor_name_set = {sensor.name for sensor in self.context["sensor_list"]}
            if not set(attrs["fieldname_sensor_dict"].values()).issubset(
                sensor_name_set
            ):
                raise serializers.ValidationError({"error": ERROR_SENSOR_NOT_FOUND})

            for field_name, sensor_name in attrs["fieldname_sensor_dict"].items():
                for sensor_tuple in admin_user_sensors:
                    sensorname, fieldname = sensor_tuple
                    if sensorname == sensor_name or fieldname == field_name:
                        raise serializers.ValidationError(
                            {"error": error_assigned_sensor(sensorname, fieldname)}
                        )

        elif request.method == "PATCH":
            if "update_field_name" not in attrs:
                raise serializers.ValidationError({"error": ERROR_UPDATE_NO_FIELD_NAME})

            field_name = attrs["update_field_name"]
            for sensor_tuple in admin_user_sensors:
                sensorname, fieldname = sensor_tuple

                if fieldname == field_name:
                    raise serializers.ValidationError(
                        {error_assigned_sensor(sensorname, fieldname)}
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
            sensor_obj = next(
                sensor
                for sensor in self.context["sensor_list"]
                if sensor.name == sensor_name
            )
            company_sensor = AdminUserSensor(
                user=validated_data["user"],
                sensor=sensor_obj,
                field_name=field_name,
            )
            admin_user_sensors.append(company_sensor)
        return AdminUserSensor.objects.bulk_create(admin_user_sensors)
