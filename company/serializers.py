from rest_framework import serializers
from .models import Company, CompanyProfile
import logging


logger = logging.getLogger(__name__)


class CompanyProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyProfile
        fields = [
            "logo",
            "phone_number",
            "address",
            "description",
        ]


class CompanySerializer(serializers.ModelSerializer):
    profile = CompanyProfileSerializer(read_only=True)

    class Meta:
        model = Company
        fields = [
            "id",
            "name",
            "email",
            "slug",
            "user_limit",
            "created_at",
            "profile",
        ]
        read_only_fields = ("id", "slug", "created_at", "profile")

    # def validate(self, attrs):
    #     request = self.context["request"]
    #     if request.method == "PATCH":
    #         email = attrs.get("email")
    #         if email:
    #             raise serializers.ValidationError(
    #                 {
    #                     "error": f"{ERROR_PERMISSION_DENIED} You cannot Update email address",
    #                 },
    #             )
    #     return attrs

    def update(self, instance, validated_data):
        name = validated_data.get("name")
        logger.warning(
            f"company name update method--new--{name} ---old---{instance.name}"
        )
        user_limit = validated_data.get("user_limit")
        if name != instance.name:
            instance.name = name
        if user_limit != instance.user_limit:
            instance.user_limit = user_limit
        instance.save()
        logger.warning(f"company name update method--{instance.name}")
        return instance
