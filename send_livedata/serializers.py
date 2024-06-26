from django.contrib.auth import get_user_model
from rest_framework import serializers

from company.models import Company
from send_livedata.cache import SendLiveDataCache
from utils.constants import UserType
from utils.error_message import (
    ERROR_ADMIN_USER_ASSOCIATED_WITH_COMPANY,
    ERROR_ADMIN_USER_NOT_FOUND,
    ERROR_COMPANY_NOT_FOUND,
    ERROR_INVALID_ASSIGNMENT,
    ERROR_ONLY_ADMIN_USER_PERMITTED,
)

from .models import SendLiveDataList

User = get_user_model()


class SendLiveDataListSerializer(serializers.ModelSerializer):
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

    class Meta:
        model = SendLiveDataList
        fields = [
            "id",
            "company",
            "user",
            "endpoint",
            "send_device_board_id",
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
        user = attrs.get("user")
        company = attrs.get("company")

        if (user and company) or (not user and not company):
            raise serializers.ValidationError({"error": ERROR_INVALID_ASSIGNMENT})

        if user:
            if user.is_associated_with_company:
                raise serializers.ValidationError(
                    {"errors": ERROR_ADMIN_USER_ASSOCIATED_WITH_COMPANY}
                )

            if user.type != UserType.ADMIN:
                raise serializers.ValidationError(
                    {"errors": ERROR_ONLY_ADMIN_USER_PERMITTED}
                )

        # checking for duplicate entry
        send_livedata_list = SendLiveDataCache.get_all_send_livedata()
        if user and any(
            user == send_livedata.user for send_livedata in send_livedata_list
        ):
            raise serializers.ValidationError(
                {"errors": "Provided user already have a endpoint associated with it"}
            )

        if company and any(
            company == send_livedata.company for send_livedata in send_livedata_list
        ):
            raise serializers.ValidationError(
                {
                    "errors": "Provided company already have a endpoint associated with it"
                }
            )

        return attrs

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        user = instance.user
        company = instance.company

        if user:
            representation.pop("company")
        if company:
            representation.pop("user")

        return representation
