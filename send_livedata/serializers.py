from rest_framework import serializers
from django.core.exceptions import ObjectDoesNotExist
from company.views import User
from .models import SendLiveDataList


class SendLiveDataListSerializer(serializers.ModelSerializer):
    class Meta:
        model = SendLiveDataList
        fields = [
            "id",
            "company",
            "user",
            "endpoint",
        ]
        extra_kwargs = {
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

    def validate(self, attrs):
        if ("user" in attrs) and ("company" in attrs):
            raise serializers.ValidationError(
                {
                    "error": "Instance should only be associate with either Admin User or Company"
                }
            )

        if "user" in attrs:
            if attrs["user"].is_associated_with_company:
                raise serializers.ValidationError(
                    {"error": "User should not be associate with the Company"}
                )

            if attrs["user"].type != "ADMIN":
                raise serializers.ValidationError(
                    {"error": "Only User be of type ADMIN are permitted"}
                )
        return attrs

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
