from django.shortcuts import get_object_or_404
from rest_framework import serializers
from django.contrib.auth import password_validation
from rest_framework.exceptions import ValidationError
from .models import User


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            "email",
            "first_name",
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
        user = User.objects.get(pk=self.context["request"].user.id)
        if user.type not in ("ADMIN", "SUPERADMIN"):
            raise serializers.ValidationError(
                {"message": "Permission Denied to the requested User"}
            )
        return attrs

    def create(self, validated_data):
        password = self.context["request"].data.get("password")
        password = self.validate_password(password)
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        return user
