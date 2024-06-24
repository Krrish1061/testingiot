from rest_framework import serializers
from dealer.models import Dealer
from users.cache import UserCache
from utils.constants import GroupName
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
    dealer = serializers.SlugRelatedField(
        queryset=Dealer.objects.all(),
        slug_field="slug",
        allow_null=True,
        required=False,
    )

    class Meta:
        model = Company
        fields = [
            "id",
            "name",
            "email",
            "slug",
            "user_limit",
            "created_at",
            "dealer",
            "profile",
        ]
        read_only_fields = ("id", "slug", "created_at", "profile")
        extra_kwargs = {
            "name": {"error_messages": {"blank": "Company name is not provided."}}
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
        user_limit = validated_data.get("user_limit")
        if name and name != instance.name:
            instance.name = name
        if user_limit is not None and user_limit != instance.user_limit:
            instance.user_limit = user_limit
        instance.save()
        return instance

    def create(self, validated_data):
        user_groups = self.context["user_groups"]
        created_user = self.context["request"].user
        validated_data["created_by"] = created_user

        if GroupName.DEALER_GROUP in user_groups:
            dealer = self.context["dealer"]
            validated_data.pop("user_limit")
            validated_data["dealer"] = dealer
        return Company.objects.create(**validated_data)
