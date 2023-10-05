from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

from company.models import Company
from users.models import AdminUser
from utils.error_message import (
    ERROR_ADMIN_USER_ASSOCIATED_WITH_COMPANY,
    ERROR_DEVICE_NO_VALID_ASSOCIATION,
)


# Create your models here.
class IotDevice(models.Model):
    """
    Model representing an IOT device.

    Fields:
    - company: The Company who owns the iot device.
    - user: The admin user who owns the iot device.
    - iot_device_location: The location of the device.
    - is_active: Flag indicating if the device is active.
    - api_key: Unique Identity for each iot devices
    - created_at: Date and time in which Iot devices is registered in system

    An Iot device is either owned by a company or an individual user but not both.
    """

    company = models.ForeignKey(
        Company,
        on_delete=models.PROTECT,
        related_name="iot_device",
        blank=True,
        null=True,
    )
    user = models.ForeignKey(
        AdminUser,
        on_delete=models.PROTECT,
        related_name="iot_device",
        blank=True,
        null=True,
    )

    iot_device_location = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.BooleanField(default=True, blank=True)
    api_key = models.CharField(
        verbose_name=" Iot device authentication Api key",
        max_length=32,
        unique=True,
        blank=True,
    )
    created_at = models.DateTimeField(default=timezone.now, editable=False)

    def __str__(self):
        """Returns the string representation of the Iot Device model"""
        if self.company:
            return f"{self.company.name}-{self.id}"
        else:
            return f"{self.user}-{self.id}"

    class Meta:
        indexes = [
            models.Index(fields=["api_key"]),
        ]

    def clean(self):
        #  not invoked automatically need to call it before saving the model calling r.clean or r.full_clean also not called on bulk_create
        if self.user and self.user.is_associated_with_company:
            raise ValidationError(ERROR_ADMIN_USER_ASSOCIATED_WITH_COMPANY)

        if (self.company and self.user) or (not self.company and not self.user):
            raise ValidationError(ERROR_DEVICE_NO_VALID_ASSOCIATION)
