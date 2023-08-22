from django.db import models
from company.models import Company
from users.models import AdminUser
from django.core.exceptions import ValidationError


# Create your models here.
class IotDevice(models.Model):
    """
    Model representing an IOT device.

    Fields:
    - company: The Company who owns the iot device.
    - user: The admin user who owns the iot device.
    - iot_device_location: The location of the device.
    - is_active: Flag indicating if the device is active.

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

    def __str__(self):
        """Returns the string representation of the Iot Device model"""
        if self.company:
            return f"{self.company.name}-{self.id}"
        else:
            return f"{self.user}-{self.id}"

    class Meta:
        # ordering = ["iot_device_id"]
        # unique_together = [["company", "iot_device_id"], ["user", "iot_device_id"]]
        indexes = [models.Index(fields=["company", "user"])]

    def clean(self):
        #  not invoked automatically need to call it before saving the model calling r.clean or r.full_clean also not called on bulk_create
        if self.user and self.user.is_associated_with_company:
            raise ValidationError("Admin User cannot be associated with company.")

        if self.company and self.user:
            raise ValidationError(
                "An Iot device cannot be owned by both a company and an individual user."
            )
        elif not self.company and not self.user:
            raise ValidationError(
                "An Iot device should be owned either by a company or an individual admin user."
            )
