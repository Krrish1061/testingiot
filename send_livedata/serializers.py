from rest_framework import serializers
from utils.constants import UserType
from utils.error_message import (
    ERROR_ADMIN_USER_ASSOCIATED_WITH_COMPANY,
    ERROR_ADMIN_USER_NOT_FOUND,
    ERROR_COMPANY_NOT_FOUND,
    ERROR_INVALID_ASSIGNMENT,
    ERROR_ONLY_ADMIN_USER_PERMITTED,
)

from .models import SendLiveDataList


class SendLiveDataListSerializer(serializers.ModelSerializer):
    class Meta:
        model = SendLiveDataList
        fields = [
            "id",
            "company",
            "user",
            "endpoints",
        ]
        extra_kwargs = {
            "company": {
                "error_messages": {"does_not_exist": ERROR_COMPANY_NOT_FOUND},
            },
            "user": {
                "error_messages": {"does_not_exist": ERROR_ADMIN_USER_NOT_FOUND},
            },
        }

    def validate(self, attrs):
        if ("user" in attrs) and ("company" in attrs):
            raise serializers.ValidationError({"error": ERROR_INVALID_ASSIGNMENT})

        if "user" in attrs:
            if attrs["user"].is_associated_with_company:
                raise serializers.ValidationError(
                    {"error": ERROR_ADMIN_USER_ASSOCIATED_WITH_COMPANY}
                )

            if attrs["user"].type != UserType.ADMIN:
                raise serializers.ValidationError(
                    {"error": ERROR_ONLY_ADMIN_USER_PERMITTED}
                )

            if not isinstance(attrs["endpoints"], list):
                raise serializers.ValidationError(
                    {"error": "Endpoints should be list of the Urls"}
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
