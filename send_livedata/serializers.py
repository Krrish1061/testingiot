from rest_framework import serializers
from company.cache import CompanyCache
from users.cache import UserCache
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
        fields = ["id", "company", "user", "endpoint", "send_device_board_id"]
        extra_kwargs = {
            "company": {
                "error_messages": {"does_not_exist": ERROR_COMPANY_NOT_FOUND},
            },
            "user": {
                "error_messages": {"does_not_exist": ERROR_ADMIN_USER_NOT_FOUND},
            },
        }

    def validate(self, attrs):
        user = attrs.get("user")
        company = attrs.get("company")

        if (user and company) or (not user and not company):
            raise serializers.ValidationError({"error": ERROR_INVALID_ASSIGNMENT})

        if user:
            if user.is_associated_with_company:
                raise serializers.ValidationError(
                    {"error": ERROR_ADMIN_USER_ASSOCIATED_WITH_COMPANY}
                )

            if user.type != UserType.ADMIN:
                raise serializers.ValidationError(
                    {"error": ERROR_ONLY_ADMIN_USER_PERMITTED}
                )
        return attrs

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        user = instance.user
        company = instance.company

        if user:
            representation["user"] = user.username
            # removing company field from response
            representation.pop("company")
        if company:
            representation["company"] = company.slug
            # removing user field from response
            representation.pop("user")

        return representation

    def to_internal_value(self, data):
        # Replace the company slug with the corresponding Company instance
        company_slug = data.get("company")
        if company_slug:
            company_instance = CompanyCache.get_company(company_slug)
            if company_instance is None:
                raise serializers.ValidationError({"error": "Company not found."})
            data["company"] = company_instance.id

        username = data.get("user")
        if username:
            user_instance = UserCache.get_user(username)
            if user_instance is None:
                raise serializers.ValidationError({"error": "User not found."})
            data["user"] = user_instance.id

        return super().to_internal_value(data)
