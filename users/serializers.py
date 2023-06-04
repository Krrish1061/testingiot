from django.shortcuts import get_object_or_404
from rest_framework import serializers
from django.contrib.auth import password_validation
from rest_framework.exceptions import ValidationError
from .models import User
from company.models import Company


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    company_names = serializers.CharField(max_length=255, source="company")

    class Meta:
        model = User
        fields = [
            "email",
            "first_name",
            "company_names",
            "last_name",
            "type",
            "password",
        ]

    def validate_password(self, value):
        """Password validator"""
        try:
            password_validation.validate_password(value)
        except ValidationError as error:
            raise serializers.ValidationError(str(error))
        return value

    def validate(self, attrs):
        user = self.context["request"].user
        if user.type not in ("ADMIN", "SUPERADMIN"):
            raise serializers.ValidationError(
                {
                    "message": "Permission Denied to the requested User",
                }
            )
        if user.type == "ADMIN" and self.context["request"].data.get("type") not in (
            "ADMIN",
            "MODERATOR",
            "VIEWER",
        ):
            raise serializers.ValidationError(
                {
                    "message": f"Permission Denied to the User {user.first_name} {user.last_name}. only user type of ('ADMIN','MODERATOR','VIEWER') are permissible.",
                }
            )
        return attrs

    def create(self, validated_data):
        password = self.context["request"].data.get("password")
        password = self.validate_password(password)
        company = (
            self.context["request"].user.company
            if self.context["request"].user.type == "ADMIN"
            else Company.objects.get(
                name=self.context["request"].data.get("company_names")
            )
        )

        validated_data["company"] = company
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        return user
