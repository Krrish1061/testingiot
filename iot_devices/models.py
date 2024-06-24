from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.db import models
from django.utils import timezone

from company.models import Company
from sensors.models import Sensor
from users.models.proxy_models import AdminUser
from utils.error_message import (
    ERROR_ADMIN_USER_ASSOCIATED_WITH_COMPANY,
    ERROR_DEVICE_NO_VALID_ASSOCIATION,
    ERROR_INVALID_FIELD_NAME,
)


# Create your models here.
class IotDevice(models.Model):
    """
    Model representing an IOT device.

    Fields:
    - company: The Company who owns the iot device.
    - user: The admin user who owns the iot device.
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
    dealer = models.ForeignKey(
        "dealer.Dealer",
        on_delete=models.PROTECT,
        related_name="iot_device",
        null=True,
        blank=True,
    )
    is_active = models.BooleanField(default=True, blank=True)
    api_key = models.CharField(
        verbose_name="Iot device authentication Api key",
        max_length=32,
        unique=True,
        blank=True,
    )
    board_id = models.PositiveSmallIntegerField(unique=True, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now, editable=False)

    def __str__(self):
        """Returns the string representation of the Iot Device model"""
        if self.company:
            return f"Iot Device {self.id} is associated with {self.company.name}"
        else:
            return f"Iot Device {self.id} is associated with {self.user}"

    class Meta:
        indexes = [
            models.Index(fields=["api_key"]),
        ]

    def clean(self):
        #  not invoked automatically need to call it before saving the model calling r.clean or r.full_clean also not called on bulk_create
        if self.user and self.user.is_associated_with_company:
            raise ValidationError(ERROR_ADMIN_USER_ASSOCIATED_WITH_COMPANY)

        if (self.company and self.user) or (
            not self.company and not self.user and not self.dealer
        ):
            raise ValidationError(ERROR_DEVICE_NO_VALID_ASSOCIATION)


# models deviceSensor
class IotDeviceSensor(models.Model):
    """Model refresenting Sensor associated with the individual Iot device"""

    iot_device = models.ForeignKey(
        IotDevice, on_delete=models.CASCADE, related_name="iot_device_sensors"
    )

    sensor = models.ForeignKey(
        Sensor,
        on_delete=models.PROTECT,
        related_name="sensors_associated_device",
        null=True,
        blank=True,
    )

    field_name = models.CharField(
        max_length=255,
        blank=False,
        validators=[
            RegexValidator(
                regex=r"^field\d+$",
                message=ERROR_INVALID_FIELD_NAME,
            ),
        ],
    )

    field_number = models.IntegerField(
        blank=True,
        null=True,
        editable=False,
        help_text="Numeric part of field_name for sorting",
    )

    max_limit = models.IntegerField(
        blank=True,
        null=True,
        help_text="If No value is provided Sensor's max Limit will be used",
    )

    min_limit = models.IntegerField(
        blank=True,
        null=True,
        help_text="If No value is provided Sensor's min Limit will be used",
    )
    created_at = models.DateTimeField(default=timezone.now, editable=False)

    def __str__(self):
        return f"{self.sensor} sensor of Iot Device {self.iot_device.id}"

    class Meta:
        unique_together = [
            ["iot_device", "field_name"],
            ["iot_device", "sensor"],
        ]
        ordering = ["iot_device", "field_number"]
        indexes = [
            models.Index(fields=["iot_device", "sensor"]),
            models.Index(fields=["iot_device", "field_name"]),
            models.Index(fields=["iot_device", "field_number"]),
        ]

    def save(self, *args, **kwargs):
        # If max_limit or min_limit is not provided, use values from the associated Sensor model
        if self.max_limit is None:
            self.max_limit = self.sensor.max_limit
        if self.min_limit is None:
            self.min_limit = self.sensor.min_limit

        self.field_number = int(self.field_name[5:])
        super().save(*args, **kwargs)


class IotDeviceDetail(models.Model):
    iot_device = models.OneToOneField(
        IotDevice, on_delete=models.CASCADE, related_name="iot_device_details"
    )
    name = models.CharField(max_length=255, blank=True, null=True)
    environment_type = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"Details of Iot Device {self.iot_device.id}"
