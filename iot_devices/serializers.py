from rest_framework import serializers
from .models import IotDevice


class IotDeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = IotDevice
        fields = [
            "id",
            "iot_device_location",
            "is_active",
            "company",
            "user",
        ]

        extra_kwargs = {
            "is_active": {"default": True},
            "company": {
                "error_messages": {
                    "does_not_exist": "Company with the specified ID does not exist."
                },
            },
            "user": {
                "error_messages": {
                    "does_not_exist": "Admin User with the specified ID does not exist."
                },
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
                    {"error": "Admin User should not be associate with any Company"}
                )

        if request.method == "POST":
            if ("user" not in attrs and "company" not in attrs) or (
                "user" in attrs and "company" in attrs
            ):
                raise serializers.ValidationError(
                    {
                        "error": "Iot device must be associated with either admin user or the company."
                    }
                )

        elif request.method == "PATCH":
            if "user" in attrs and "company" in attrs:
                raise serializers.ValidationError(
                    {
                        "error": "Iot device must be associated with either admin user or the company."
                    }
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
