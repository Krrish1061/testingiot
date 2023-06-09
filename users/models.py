from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from .managers import UserManager
from company.models import Company


# Create your models here.
class User(AbstractBaseUser, PermissionsMixin):
    class UserTypes(models.TextChoices):
        SUPERADMIN = "SUPERADMIN", "superadmin"
        ADMIN = "ADMIN", "admin"
        MODERATOR = "MODERATOR", "moderator"
        VIEWER = "VIEWER", "viewer"

    base_type = UserTypes.VIEWER

    company = models.ForeignKey(
        Company,
        on_delete=models.PROTECT,
        related_name="company_users",
        blank=True,
        null=True,
    )
    first_name = models.CharField("first name", max_length=150, blank=True)
    last_name = models.CharField("last name", max_length=150, blank=True)
    email = models.EmailField(verbose_name="email address", max_length=255, unique=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(default=timezone.now, editable=False)
    api_key = models.CharField(
        verbose_name="Authentication Api key", max_length=32, null=True, blank=True
    )
    type = models.CharField(
        verbose_name="User type",
        max_length=20,
        choices=UserTypes.choices,
        default=base_type,
        blank=True,
        null=False,
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        """Returns the string representation of the User model"""
        return self.email


class AdminManager(UserManager):
    """Defining the Model Manager for the Admin Proxy Model"""

    def get_queryset(self, *args, **kwargs):
        """Filtering the queryset by the Admin usertype"""
        return super().get_queryset(*args, **kwargs).filter(type=User.UserTypes.ADMIN)


class AdminUser(User):
    """Defining the proxy model for the Admin User"""

    base_type = User.UserTypes.ADMIN
    objects = AdminManager()

    class Meta:
        proxy = True


# Modifying the query set for proxy Moderator model
class ModeratorManager(UserManager):
    """Defining the Model Manager for the Moderator Proxy Model"""

    def get_queryset(self, *args, **kwargs):
        return (
            super().get_queryset(*args, **kwargs).filter(type=User.UserTypes.MODERATOR)
        )


# Defining the proxy model for Moderator usertypes
class ModeratorUser(User):
    """Defining the proxy model for the Moderator User"""

    base_type = User.UserTypes.MODERATOR
    objects = ModeratorManager()

    class Meta:
        proxy = True


# Modifying the query set for proxy Viewer model
class ViewerManager(UserManager):
    """Defining the Model Manager for the Viewer Proxy Model"""

    def get_queryset(self, *args, **kwargs):
        return super().get_queryset(*args, **kwargs).filter(type=User.UserTypes.VIEWER)


# defining the proxy model for viewer usertypes
class ViewerUser(User):
    """Defining the proxy model for the viewer User"""

    base_type = User.UserTypes.VIEWER
    objects = ViewerManager()

    class Meta:
        proxy = True
