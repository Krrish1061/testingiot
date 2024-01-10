from django.contrib.auth import password_validation

# from django.core.validators import validate_email
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import Group
from users.utilis import get_group_name
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
from company.models import Company


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


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            "first_name",
            "last_name",
            "profile_picture",
            "facebook_profile",
            "linkedin_profile",
            "phone_number",
            "date_of_birth",
            "address",
            "is_username_modified",
        ]


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(
        write_only=True,
        required=True,
        error_messages={"required": "No current password is provided."},
    )
    new_password = serializers.CharField(
        write_only=True,
        required=True,
        error_messages={"required": "No New password is provided."},
    )

    def validate_current_password(self, value):
        user = self.context["user"]
        # checking current password
        if not user.check_password(value):
            raise serializers.ValidationError({"error": "Incorrect Current Password."})
        return value

    def validate_new_password(self, value):
        user = self.context["user"]
        # new password must be different from current password
        if user.check_password(value):
            raise serializers.ValidationError(
                {"error": "New password must be different from the current password."}
            )

        # validating the new password useing django password validator
        password_validation.validate_password(value)
        return value

    # def validate(self, attrs):
    #     user = self.context["user"]
    #     if not user.check_password(attrs.get("old_password")):
    #         raise serializers.ValidationError({"error": "Incorrect Current Password."})

    #     # new password must be different from current password
    #     if user.check_password(attrs.get("new_password")):
    #         raise serializers.ValidationError(
    #             {"error": "New password must be different from the current password."}
    #         )
    #     # validating the new password useing django password validator
    #     password_validation.validate_password(attrs.get("new_password"))
    #     return attrs


class UserPasswordSerializer(serializers.Serializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        error_messages={"required": "No password is provided."},
    )

    def validate(self, attrs):
        password_validation.validate_password(attrs.get("password"))
        return attrs


class UserSerializer(serializers.ModelSerializer):
    groups = GroupSerializer(many=True, read_only=True)
    profile = UserProfileSerializer(read_only=True)

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
            "date_joined",
            "profile",
            "created_by",
            "user_limit",
        ]
        read_only_fields = (
            "id",
            "is_associated_with_company",
            "date_joined",
            "username",
            "groups",
        )
        extra_kwargs = {
            "company": {
                "error_messages": {"does_not_exist": ERROR_COMPANY_NOT_FOUND},
            },
        }

    def to_internal_value(self, data):
        # Replace the company slug with the corresponding Company instance
        company_slug = data.get("company")
        if company_slug:
            try:
                company_instance = Company.objects.get(slug=company_slug)
                data["company"] = company_instance.pk
            except Company.DoesNotExist:
                raise serializers.ValidationError({"error": "Company not found."})

        return super().to_internal_value(data)

    def to_representation(self, instance):
        # replace company instance with the company slug
        representation = super().to_representation(instance)
        if instance.is_associated_with_company:
            representation["company"] = instance.company.slug
        return representation

    def validate_password(self, value):
        # Password validator
        try:
            password_validation.validate_password(value)
        except ValidationError as error:
            raise serializers.ValidationError(str(error))
        return value

    # def validate_email(self, email):
    #     # Email Validator
    #     try:
    #         validate_email(email)
    #     except ValidationError:
    #         return True
    #     return False

    def user_type_validation(self, user_groups, user_type):
        # return true if user type is invalid

        if any(
            group_name in user_groups
            for group_name in (
                GroupName.COMPANY_SUPERADMIN_GROUP,
                GroupName.SUPERADMIN_GROUP,
            )
        ):
            if user_type not in (
                UserType.ADMIN,
                UserType.MODERATOR,
                UserType.VIEWER,
            ):
                return True

        else:
            if user_type not in (
                UserType.MODERATOR,
                UserType.VIEWER,
            ):
                return True
        return False

    def validate_user_type(self, user_type, user_groups):
        if self.user_type_validation(user_groups, user_type):
            raise serializers.ValidationError(
                {
                    "error": f"{ERROR_PERMISSION_DENIED} {error_setting_invalid_user_type_message(user_type)}"
                }
            )

    def validate(self, attrs):
        request = self.context["request"]
        user_groups = self.context["user_groups"]
        user = request.user
        user_type = attrs.get("type")
        if request.method == "POST":
            self.validate_user_type(user_type, user_groups)

            # associating the new user with the same company as of the user which created them
            if GroupName.ADMIN_GROUP in user_groups and user.is_associated_with_company:
                attrs["company"] = user.company

        elif request.method == "PATCH":
            if user == self.instance:
                raise serializers.ValidationError(
                    {
                        "error": f"{ERROR_PERMISSION_DENIED} You can't update your own account"
                    }
                )
            if GroupName.ADMIN_GROUP in user_groups:
                # is admin user trying to update superadmin -> raise error
                if GroupName.SUPERADMIN_GROUP in [
                    group.name for group in self.instance.groups.all()
                ]:
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
                        not (GroupName.COMPANY_SUPERADMIN_GROUP in user_groups)
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

                    if self.instance.created_by != user:
                        raise serializers.ValidationError(
                            {
                                "error": f"{ERROR_PERMISSION_DENIED} {ERROR_UPDATING_OTHER_USER}"
                            },
                        )

            # checking fields provided are allowed to update
            allowed_fields = ["type", "is_active", "user_limit"]
            if not any(field in allowed_fields for field in attrs.keys()):
                return attrs

            if "type" in attrs:
                self.validate_user_type(user_type, user_groups)
                if GroupName.COMPANY_SUPERADMIN_GROUP in [
                    group.name for group in self.instance.groups.all()
                ]:
                    raise serializers.ValidationError(
                        {
                            "error": f"{ERROR_PERMISSION_DENIED} You cannot update the type of the Company's SuperAdmin",
                        },
                    )

        if "user_limit" in attrs:
            if not GroupName.SUPERADMIN_GROUP in user_groups:
                raise serializers.ValidationError(
                    {
                        "error": f"{ERROR_PERMISSION_DENIED} You cannot update the user limit",
                    },
                )
        return attrs

    def handle_user_type_change(self, user, old_user_type, new_user_type):
        # Removing user from the old group
        old_group_name = get_group_name(old_user_type)
        old_group = Group.objects.get(name=old_group_name)
        user.groups.remove(old_group)

        # Adding user to the new group
        new_group_name = get_group_name(new_user_type)
        new_group = Group.objects.get(name=new_group_name)
        user.groups.add(new_group)

    def update(self, instance, validated_data):
        user_type = validated_data.get("type")
        is_active = validated_data.get("is_active")
        user_limit = validated_data.get("user_limit")

        if is_active is not None:
            instance.is_active = is_active
        if user_limit:
            instance.type = user_limit

        if user_type and user_type != instance.type:
            old_user_type = instance.type
            instance.type = user_type
            self.handle_user_type_change(instance, old_user_type, user_type)

        instance.save()
        return instance

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        user.set_unusable_password()
        return user
