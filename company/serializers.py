from rest_framework import serializers
from .models import Company, CompanyProfile


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
        extra_kwargs = {
            "name": {"error_messages": {"blank": "Company name is not provided."}}
        }

    def update(self, instance, validated_data):
        name = validated_data.get("name")
        user_limit = validated_data.get("user_limit")
        if name != instance.name:
            instance.name = name
        if user_limit is not None and user_limit != instance.user_limit:
            instance.user_limit = user_limit
        instance.save()
        return instance
