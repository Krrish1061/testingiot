from rest_framework import serializers

from utils.error_message import (
    ERROR_ADMIN_USER_ASSOCIATED_WITH_COMPANY,
    ERROR_ADMIN_USER_NOT_FOUND,
    ERROR_COMPANY_NOT_FOUND,
    ERROR_DEVICE_NO_VALID_ASSOCIATION,
)

from .models import IotDevice


class IotDeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = IotDevice
        fields = [
            "id",
            "iot_device_location",
            "is_active",
            "created_at",
            "company",
            "user",
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

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        user = instance.user
        company = instance.company

        if user:
            representation["user"] = user.email
            # removing company field from response
            representation.pop("company")
        if company:
            representation["company"] = company.name
            # removing user field from response
            representation.pop("user")

        return representation

    def validate(self, attrs):
        request = self.context["request"]

        if "user" in attrs:
            if attrs.get("user").is_associated_with_company:
                raise serializers.ValidationError(
                    {"error": ERROR_ADMIN_USER_ASSOCIATED_WITH_COMPANY}
                )

        if request.method == "POST":
            if ("user" not in attrs and "company" not in attrs) or (
                "user" in attrs and "company" in attrs
            ):
                raise serializers.ValidationError(
                    {"error": ERROR_DEVICE_NO_VALID_ASSOCIATION}
                )

        elif request.method == "PATCH":
            if "user" in attrs and "company" in attrs:
                raise serializers.ValidationError(
                    {"error": ERROR_DEVICE_NO_VALID_ASSOCIATION}
                )

        return attrs

    def update(self, instance, validated_data):
        user = validated_data.get("user")
        company = validated_data.get("company")
        if instance.user and company:
            instance.user = None
            instance.company = company
        if instance.company and user:
            instance.company = None
            instance.user = user
        if "iot_device_location" in validated_data:
            instance.iot_device_location = validated_data["iot_device_location"]
        if "is_active" in validated_data:
            instance.is_active = validated_data["is_active"]
        instance.save()
        return instance
