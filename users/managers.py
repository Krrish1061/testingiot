from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth import get_user_model


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
            raise ValueError("Users must have an email address")

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_staffuser(self, email, password, **extra_fields):
        """
        Create and save a staff user with the given email and password.
        """
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", False)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Staff user must have is_staff=True")
        if extra_fields.get("is_superuser") is not False:
            raise ValueError("Staff user must have is_superuser=False")

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
            raise ValueError("Superuser must have is_staff=True")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True")

        return self.create_user(email, password, **extra_fields)


class AdminManager(UserManager):
    """Defining the Model Manager for the Admin Proxy Model"""

    def get_queryset(self, *args, **kwargs):
        """Filtering the queryset by the Admin usertype"""
        return (
            super()
            .get_queryset(*args, **kwargs)
            .filter(type=self.model.UserTypes.ADMIN)
        )
