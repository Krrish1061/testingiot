from django.contrib.auth import password_validation
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import Group
from utils.constants import GroupName, UserType
from utils.error_message import (
    ERROR_COMPANY_NOT_FOUND,
    ERROR_PERMISSION_DENIED,
    ERROR_UPDATING_OTHER_ADMIN_USER,
    ERROR_UPDATING_OTHER_COMPANY_USER,
    ERROR_UPDATING_OTHER_USER,
    ERROR_UPDATING_OWN_ACCOUNT_IS_ACTIVE_TO_FALSE,
    ERROR_UPDATING_OWN_ACCOUNT_USER_TYPE,
    error_setting_invalid_user_type_message,
)

from .models import User, UserProfile


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token["type"] = user.type
        token["is_associated_with_company"] = user.is_associated_with_company
        token["username"] = user.username
        token["groups"] = [group.name for group in user.groups.all()]
        return token


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = "name"

    def to_representation(self, instance):
        return instance.name


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    groups = GroupSerializer(many=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "company",
            "is_associated_with_company",
            "type",
            "groups",
            "is_active",
            "password",
            "date_joined",
        ]
        read_only_fields = ("is_associated_with_company", "date_joined", "username")
        extra_kwargs = {
            "company": {
                "error_messages": {"does_not_exist": ERROR_COMPANY_NOT_FOUND},
            },
        }

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.is_associated_with_company:
            representation["company"] = instance.company.slug
        return representation

    def validate_password(self, value):
        """Password validator"""
        try:
            password_validation.validate_password(value)
        except ValidationError as error:
            raise serializers.ValidationError(str(error))
        return value

    def user_type_validation(user, attrs):
        # no one can create a super_admin user
        if attrs.get("type") == UserType.SUPERADMIN:
            return False

        if user.type == UserType.ADMIN:
            if user.is_associated_with_company:
                # if user is associated with company he/she can only create admin, moderator, viewer type user
                if attrs.get("type") not in (
                    UserType.ADMIN,
                    UserType.MODERATOR,
                    UserType.VIEWER,
                ):
                    return False

                # ensure that company admin user cannot create other admin user
                if (
                    attrs.get("type") == UserType.ADMIN
                    and not user.groups.filter(
                        name=GroupName.COMPANY_SUPERADMIN_GROUP
                    ).exists()
                ):
                    return False

            # if user is not associated with company he/she can only create moderator and viewer type user
            if not user.is_associated_with_company and attrs.get("type") not in (
                UserType.MODERATOR,
                UserType.VIEWER,
            ):
                return False
        return True

    def validate(self, attrs):
        request = self.context["request"]
        user = request.user
        if request.method == "POST":
            user_type = attrs.get("type")
            if self.user_type_validation(user, attrs):
                raise serializers.ValidationError(
                    {
                        "error": f"{ERROR_PERMISSION_DENIED} {error_setting_invalid_user_type_message(user_type)}",
                    },
                )

        elif request.method == "PATCH":
            if user.type == UserType.ADMIN and user != self.instance:
                # is admin user trying to update superadmin -> raise error
                if self.instance.type == UserType.SUPERADMIN:
                    raise serializers.ValidationError(
                        {"error": ERROR_PERMISSION_DENIED}
                    )
                # is admin user belongs to a company
                if user.is_associated_with_company:
                    # checking if company associated with the users is same or not
                    if user.company != self.instance.company:
                        raise serializers.ValidationError(
                            {
                                "error": f"{ERROR_PERMISSION_DENIED} {ERROR_UPDATING_OTHER_COMPANY_USER}"
                            },
                        )

                    # checks if admin user is trying to update company superadmin user
                    # Admin user cannot change the info of other admin user unless requested admin user is created by the superadmin
                    if (
                        not user.groups.filter(
                            name=GroupName.COMPANY_SUPERADMIN_GROUP
                        ).exists()
                        and self.instance.type == UserType.ADMIN
                    ):
                        raise serializers.ValidationError(
                            {
                                "error": f"{ERROR_PERMISSION_DENIED} {ERROR_UPDATING_OTHER_ADMIN_USER}"
                            },
                        )

                # admin user does not belong to company
                else:
                    if self.instance.type == UserType.ADMIN:
                        raise serializers.ValidationError(
                            {
                                "error": f"{ERROR_PERMISSION_DENIED} {ERROR_UPDATING_OTHER_ADMIN_USER}"
                            },
                        )

                    if self.instance.user_extra_field.created_by != user:
                        raise serializers.ValidationError(
                            {
                                "error": f"{ERROR_PERMISSION_DENIED} {ERROR_UPDATING_OTHER_USER}"
                            },
                        )
        # checking fields provided are allowed to update
        allowed_fields = ["type", "is_active"]
        if not any(field in allowed_fields for field in attrs.keys()):
            return attrs
        if "is_active" in attrs:
            if user == self.instance and attrs.get("is_active") == False:
                raise serializers.ValidationError(
                    {
                        "error": f"{ERROR_PERMISSION_DENIED} {ERROR_UPDATING_OWN_ACCOUNT_IS_ACTIVE_TO_FALSE}"
                    },
                )

        if "type" in attrs:
            user_type = attrs.get("type")
            if user == self.instance:
                raise serializers.ValidationError(
                    {
                        "error": f"{ERROR_PERMISSION_DENIED} {ERROR_UPDATING_OWN_ACCOUNT_USER_TYPE}"
                    },
                )

            if self.user_type_validation(user, attrs):
                raise serializers.ValidationError(
                    {
                        "error": f"{ERROR_PERMISSION_DENIED} {error_setting_invalid_user_type_message(user_type)}",
                    },
                )

        return attrs

    def update(self, instance, validated_data):
        type = validated_data.get("type")
        is_active = validated_data.get("is_active")

        if type:
            # need to convert user group delete
            instance.type = type
        if is_active:
            # cannot set own account to set is_active to false
            instance.is_active = is_active
        return instance

    def create(self, validated_data):
        requested_user = self.context["request"].user
        password = validated_data.get("password")
        password = self.validate_password(password)

        # i don't think i need to check this
        if (
            requested_user.type == UserType.ADMIN
            and requested_user.is_associated_with_company
        ):
            validated_data["company"] = requested_user.company

        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            "user",
            "first_name",
            "last_name",
            "profile_picture",
            "facebook_profile",
            "linkedin_profile",
            "phone_number",
            "date_of_birth",
        ]
        read_only_fields = ("user",)
