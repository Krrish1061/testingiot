from rest_framework import serializers
from django.contrib.auth import password_validation
from rest_framework.exceptions import ValidationError
from .models import User, UserProfile
from company.models import Company
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token["type"] = user.type
        token["is_associated_with_company"] = user.is_associated_with_company
        token["name"] = user.profile.first_name + " " + user.profile.last_name

        return token


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "company",
            "is_associated_with_company",
            "type",
            "password",
            "date_joined",
        ]
        read_only_fields = ("is_associated_with_company", "date_joined")
        extra_kwargs = {
            "company": {
                "error_messages": {
                    "does_not_exist": "Company with the specified ID does not exist."
                },
            },
        }

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.is_associated_with_company:
            representation["company"] = instance.company.name
        return representation

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
                    "error": "Permission Denied to the requested User Type",
                },
            )
        if (
            user.type == "ADMIN"
            and user.is_associated_with_company
            and attrs.get("type")
            not in (
                "ADMIN",
                "MODERATOR",
                "VIEWER",
            )
        ):
            raise serializers.ValidationError(
                {
                    "error": f"Permission Denied to the User {user.profile.first_name} {user.profile.last_name}. Only creation of user type of ('ADMIN','MODERATOR','VIEWER') are permissible.",
                },
            )

        if (
            user.type == "ADMIN"
            and not user.is_associated_with_company
            and attrs.get("type")
            not in (
                "MODERATOR",
                "VIEWER",
            )
        ):
            raise serializers.ValidationError(
                {
                    "error": f"Permission Denied to the User {user.profile.first_name} {user.profile.last_name}. Only creation of user type of ('MODERATOR','VIEWER') are permissible.",
                },
            )
        return attrs

    def update(self, instance, validated_data):
        requested_user = self.context["request"].user
        allowed_fields = ["email", "type"]
        if allowed_fields not in validated_data.keys():
            return instance
        if requested_user.type == "ADMIN":
            if requested_user.is_associated_with_company:
                # checking if company associated with the users is same or not
                if requested_user.company != instance.company:
                    raise serializers.ValidationError(
                        {
                            "error": f"Permission Denied to the User. Updating user intance is allowed only for user who belongs to same company",
                        },
                    )

                # checking if the user requested for the modification is superadmin or not
                # raising error if the requested user and user requested for the update is not same and user requested for the update is created by superadmin
                if (
                    instance.user_extra_field.created_by.type == "SUPERADMIN"
                    and requested_user != instance
                ):
                    raise serializers.ValidationError(
                        {
                            "error": f"Permission Denied!. Altering the field of the main account is permissiable",
                        },
                    )

                # Admin user cannot change the info of other admin user unless requested admin user is created by the superadmin
                if (
                    instance.type == "ADMIN"
                    and requested_user.user_extra_field.created_by.type != "SUPERADMIN"
                ):
                    raise serializers.ValidationError(
                        {
                            "error": f"Permission Denied!. Changing other Admin user info is not allowed",
                        },
                    )

            else:
                if instance.user_extra_field.created_by != requested_user:
                    raise serializers.ValidationError(
                        {
                            "error": f"Permission Denied to the User.",
                        },
                    )

        email = validated_data.get("email")
        type = validated_data.get("type")

        if email:
            instance.email = email
        if type:
            # need to convert
            instance.type = type
        instance.save()
        return instance

    def create(self, validated_data):
        requested_user = self.context["request"].user
        password = validated_data.get("password")
        password = self.validate_password(password)

        if requested_user.type == "ADMIN":
            if requested_user.is_associated_with_company:
                validated_data["company"] = requested_user.company
        # else:
        #     company = validated_data.get("company")
        #     if company:
        #         try:
        #             company_obj = Company.objects.get(name=company)
        #             validated_data["company"] = company_obj
        #         except Company.DoesNotExist:
        #             raise serializers.ValidationError(
        #                 {"error": f"Company {company} does not exists."},
        #             )

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
