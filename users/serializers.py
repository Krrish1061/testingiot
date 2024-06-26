from django.contrib.auth import password_validation
from django.contrib.auth.models import Group
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from company.models import Company
from dealer.models import Dealer
from users.models.user_models import User, UserProfile
from users.utilis import get_group_name
from utils.constants import GroupName, UserType
from utils.error_message import (
    ERROR_COMPANY_NOT_FOUND,
    ERROR_PERMISSION_DENIED,
    ERROR_UPDATING_OTHER_ADMIN_USER,
    ERROR_UPDATING_OTHER_COMPANY_USER,
    ERROR_UPDATING_OTHER_USER,
    error_setting_invalid_user_type_message,
)


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

    def validate_old_password(self, value):
        user = self.context["user"]
        # checking current password
        if not user.check_password(value):
            raise serializers.ValidationError("Incorrect Current Password.")
        return value

    def validate_new_password(self, value):
        user = self.context["user"]
        # new password must be different from current password
        if user.check_password(value):
            raise serializers.ValidationError(
                "New password must be different from the current password."
            )
        # validating the new password useing django password validator
        password_validation.validate_password(value)
        return value


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
    company = serializers.SlugRelatedField(
        queryset=Company.objects.all(),
        slug_field="slug",
        allow_null=True,
        required=False,
    )
    dealer = serializers.SlugRelatedField(
        queryset=Dealer.objects.all(),
        slug_field="slug",
        allow_null=True,
        required=False,
    )
    created_by = serializers.SlugRelatedField(
        slug_field="username",
        allow_null=True,
        read_only=True,
    )

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "company",
            "dealer",
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
            "profile",
            "created_by",
        )
        extra_kwargs = {
            "company": {
                "error_messages": {"does_not_exist": ERROR_COMPANY_NOT_FOUND},
            },
        }

    def validate_password(self, value):
        # Password validator
        try:
            password_validation.validate_password(value)
        except ValidationError as error:
            raise serializers.ValidationError(str(error))
        return value

    def user_type_validation(self, user_groups, user_type):
        # return true if user type is invalid
        # user_groups is the groups list that the requested user belongs
        # user Type is the type of the new user that needs to be created
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

        elif GroupName.DEALER_GROUP in user_groups:
            if user_type != UserType.ADMIN:
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
                    "errors": f"{ERROR_PERMISSION_DENIED} {error_setting_invalid_user_type_message(user_type)}"
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
            if GroupName.ADMIN_GROUP in user_groups:
                if user.is_associated_with_company:
                    attrs["company"] = user.company
                if "user_limit" in attrs:
                    attrs.pop("user_limit")
            if (
                GroupName.SUPERADMIN_GROUP in user_groups
                and attrs.get("type") == UserType.ADMIN
                and attrs.get("company") is None
                and attrs.get("user_limit") is None
            ):
                attrs["user_limit"] = 5

            if GroupName.DEALER_GROUP in user_groups:
                if attrs.get("company") is not None:
                    raise serializers.ValidationError(
                        {
                            "errors": f"{ERROR_PERMISSION_DENIED} You cannot create a user that is associated with company",
                        },
                    )
                attrs["user_limit"] = 5
                attrs["dealer"] = user.dealer

            attrs["created_by"] = user

        elif request.method == "PATCH":
            if user == self.instance:
                raise serializers.ValidationError(
                    {
                        "errors": f"{ERROR_PERMISSION_DENIED} You can't update your own account"
                    }
                )
            if GroupName.ADMIN_GROUP in user_groups:
                # is admin user trying to update superadmin -> raise error
                if GroupName.SUPERADMIN_GROUP in [
                    group.name for group in self.instance.groups.all()
                ]:
                    raise serializers.ValidationError(
                        {"errors": ERROR_PERMISSION_DENIED}
                    )

                # is admin user belongs to a company
                if user.is_associated_with_company:
                    # checking if company associated with the users is same or not
                    if user.company != self.instance.company:
                        raise serializers.ValidationError(
                            {
                                "errors": f"{ERROR_PERMISSION_DENIED} {ERROR_UPDATING_OTHER_COMPANY_USER}"
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
                                "errors": f"{ERROR_PERMISSION_DENIED} {ERROR_UPDATING_OTHER_ADMIN_USER}"
                            },
                        )

                # admin user does not belong to company
                else:
                    if self.instance.type == UserType.ADMIN:
                        raise serializers.ValidationError(
                            {
                                "errors": f"{ERROR_PERMISSION_DENIED} {ERROR_UPDATING_OTHER_ADMIN_USER}"
                            },
                        )

                    if self.instance.created_by != user:
                        raise serializers.ValidationError(
                            {
                                "errors": f"{ERROR_PERMISSION_DENIED} {ERROR_UPDATING_OTHER_USER}"
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
                            "errors": f"{ERROR_PERMISSION_DENIED} You cannot update the type of the Company's SuperAdmin",
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
        user_groups = self.context["user_groups"]
        user_type = validated_data.get("type")

        if GroupName.SUPERADMIN_GROUP in user_groups:
            is_active = validated_data.get("is_active")
            user_limit = validated_data.get("user_limit")
            if is_active is not None and is_active != instance.is_active:
                instance.is_active = is_active

            if user_limit is not None and user_limit != instance.user_limit:
                instance.user_limit = user_limit

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
