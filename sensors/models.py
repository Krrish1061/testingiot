from django.db import models
from company.models import Company
from users.models import AdminUser
from django.core.exceptions import ValidationError


# set maximum limit and minimum limit for sensor
class Sensor(models.Model):
    """
    Model representing a sensor.

    Fields:
    - name: The name of the sensor.
    - value_type: The type of the sensor value.
    - unit: The unit of measurement for the sensor value.
    - symbol: symbol of the sensor

    """

    name = models.CharField(max_length=255, unique=True)
    value_type = models.CharField(max_length=150)
    unit = models.CharField(max_length=150, null=True, blank=True)
    symbol = models.CharField(max_length=10, null=True, blank=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        self.name = self.name.lower()
        return super().save(*args, **kwargs)

    class Meta:
        ordering = ["name"]
        unique_together = ["name"]
        indexes = [models.Index(fields=["name"])]


class CompanySensor(models.Model):
    """
    Model representing a sensor associated with a Company.

    Fields:
    - company: The Company who owns the sensor.
    - sensor: The sensor associated with the Company.
    - field_name: The name of the field for the sensor.

    """

    company = models.ForeignKey(
        Company, on_delete=models.PROTECT, related_name="company_sensor_list"
    )

    sensor = models.ForeignKey(
        Sensor, on_delete=models.PROTECT, related_name="company_sensor"
    )
    field_name = models.CharField(
        max_length=255,
        blank=False,
    )

    def __str__(self):
        return f"{self.company.name} - {self.sensor}"

    class Meta:
        unique_together = [["company", "field_name"], ["company", "sensor"]]
        ordering = ["company", "field_name"]
        indexes = [
            models.Index(fields=["company", "sensor"]),
            models.Index(fields=["company", "field_name"]),
        ]


class AdminUserSensor(models.Model):
    """
    Model representing a sensor associated with a Admin User.

    Fields:
    - user: The admin user who owns the sensor and is not associated with any of the company.
    - sensor: The sensor associated with the user.
    - field_name: The name of the field for the sensor.

    """

    user = models.ForeignKey(
        AdminUser, on_delete=models.PROTECT, related_name="user_sensor_list"
    )

    sensor = models.ForeignKey(
        Sensor, on_delete=models.PROTECT, related_name="user_sensor"
    )
    field_name = models.CharField(
        max_length=255,
        blank=False,
    )

    def __str__(self):
        return f"{self.user} - {self.sensor}"

    class Meta:
        unique_together = [["user", "field_name"], ["user", "sensor"]]
        ordering = ["user", "field_name"]
        indexes = [
            models.Index(fields=["user", "sensor"]),
            models.Index(fields=["user", "field_name"]),
        ]

    def clean(self):
        if self.user.is_associated_with_company:
            raise ValidationError("User should not be associate with any Company")
