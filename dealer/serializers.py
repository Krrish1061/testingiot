from rest_framework import serializers
from users.cache import UserCache
from utils.constants import GroupName, UserType
from django.contrib.auth.models import Group
from .models import Dealer, DealerProfile
from django.contrib.auth import get_user_model

User = get_user_model()


class DealerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DealerProfile
        fields = [
            "logo",
            "phone_number",
            "address",
            "description",
        ]


class DealerSerializer(serializers.ModelSerializer):
    profile = DealerProfileSerializer(read_only=True)

    class Meta:
        model = Dealer
        fields = [
            "id",
            "name",
            "email",
            "slug",
            "user_company_limit",
            "created_at",
            "profile",
        ]
        read_only_fields = ("id", "slug", "created_at", "profile")
        extra_kwargs = {
            "name": {"error_messages": {"blank": "Dealer name is not provided."}}
        }

    def validate(self, attrs):
        request = self.context["request"]
        if request.method == "POST":
            email = attrs.get("email")
            users = UserCache.get_all_users()
            # validating the email is not duplicate in the user model, company model and dealer model
            if any(email == user.email for user in users):
                raise serializers.ValidationError(
                    {
                        "errors": "This email already exist in our system. Please! use another email"
                    }
                )
            attrs["created_by"] = request.user

        return super().validate(attrs)

    def update(self, instance, validated_data):
        name = validated_data.get("name")
        user_company_limit = validated_data.get("user_company_limit")
        if name and name != instance.name:
            instance.name = name
        if (
            user_company_limit is not None
            and user_company_limit != instance.user_company_limit
        ):
            instance.user_company_limit = user_company_limit
        instance.save()
        return instance
