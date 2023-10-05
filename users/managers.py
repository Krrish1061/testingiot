from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import Group

from utils.constants import GroupName, UserType
from utils.error_message import (
    ERROR_NO_EMAIL,
    ERROR_STAFF_USER_SET_FALSE,
    ERROR_STAFF_USER_SET_IS_SUPERADMIN_TRUE,
    ERROR_SUPERADMIN_SET_IS_STAFF_FALSE,
    ERROR_SUPERADMIN_SET_IS_SUPERUSER_FALSE,
)


class UserManager(BaseUserManager):
    """
    Custom user model manager where email is the unique identifiers
    for authentication.
    """

    def create_user(self, email, password=None, **extra_fields):
        """
        Creates and saves a User with the given email and password
        """

        if not email:
            raise ValueError(ERROR_NO_EMAIL)

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)

        if user.type == UserType.SUPERADMIN:
            super_admin_group = Group.objects.get(name=GroupName.SUPERADMIN_GROUP)
            user.groups.add(super_admin_group)
        elif user.type == UserType.ADMIN:
            admin_group = Group.objects.get(name=GroupName.ADMIN_GROUP)
            user.groups.add(admin_group)
        elif user.type == UserType.MODERATOR:
            moderator_group = Group.objects.get(name=GroupName.MODERATOR_GROUP)
            user.groups.add(moderator_group)
        else:
            viewer_group = Group.objects.get(name=GroupName.VIEWER_GROUP)
            user.groups.add(viewer_group)
        return user

    def create_staffuser(self, email, password, **extra_fields):
        """
        Create and save a staff user with the given email and password.
        """
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", False)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError(ERROR_STAFF_USER_SET_FALSE)
        if extra_fields.get("is_superuser") is not False:
            raise ValueError(ERROR_STAFF_USER_SET_IS_SUPERADMIN_TRUE)

        return self.create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        """
        Create and save a superUser with tyhe given emial and password
        """

        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("type", self.model.UserTypes.SUPERADMIN)

        if extra_fields.get("is_staff") is not True:
            raise ValueError(ERROR_SUPERADMIN_SET_IS_STAFF_FALSE)
        if extra_fields.get("is_superuser") is not True:
            raise ValueError(ERROR_SUPERADMIN_SET_IS_SUPERUSER_FALSE)

        return self.create_user(email, password, **extra_fields)

    # def delete(self, )


class AdminManager(UserManager):
    """Defining the Model Manager for the Admin Proxy Model"""

    def get_queryset(self, *args, **kwargs):
        """Filtering the queryset by the Admin usertype"""
        return (
            super()
            .get_queryset(*args, **kwargs)
            .filter(type=self.model.UserTypes.ADMIN)
        )


# Modifying the query set for proxy Moderator model
class ModeratorManager(UserManager):
    """Defining the Model Manager for the Moderator Proxy Model"""

    def get_queryset(self, *args, **kwargs):
        """Filtering the queryset by the MODERATOR usertype"""
        return (
            super()
            .get_queryset(*args, **kwargs)
            .filter(type=self.model.UserTypes.MODERATOR)
        )


# Modifying the query set for proxy Viewer model
class ViewerManager(UserManager):
    """Defining the Model Manager for the Viewer Proxy Model"""

    def get_queryset(self, *args, **kwargs):
        """Filtering the queryset by the VIEWER usertype"""
        return (
            super()
            .get_queryset(*args, **kwargs)
            .filter(type=self.model.UserTypes.VIEWER)
        )
