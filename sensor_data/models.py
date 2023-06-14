from typing import Iterable, Optional
from django.db import models
from django.utils import timezone
from company.models import Company


# Create your models here.
class IotDevice(models.Model):
    """
    Model representing an IOT device.

    Fields:
    - company: The Company who owns the iot device.
    - iot_device_id: The unique identifier of the device.
    - iot_device_location: The location of the device.
    - is_active: Flag indicating if the device is active.

    """

    company = models.ForeignKey(
        Company, on_delete=models.PROTECT, related_name="iot_device"
    )
    iot_device_id = models.PositiveIntegerField(primary_key=True, unique=True)
    iot_device_location = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.BooleanField(default=True, blank=True)

    def __str__(self):
        return f"{self.company.name}-{self.iot_device_id}"

    class Meta:
        ordering = ["iot_device_id"]
        unique_together = ["company", "iot_device_id"]
        indexes = [models.Index(fields=["company", "iot_device_id"])]


class Sensor(models.Model):
    """
    Model representing a sensor.

    Fields:
    - name: The name of the sensor.
    - value_type: The type of the sensor value.
    - unit: The unit of measurement for the sensor value.

    """

    name = models.CharField(max_length=255, unique=True)
    value_type = models.CharField(max_length=150)
    unit = models.CharField(max_length=150, null=True, blank=True)

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
        Company, on_delete=models.PROTECT, related_name="sensor"
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


class SensorData(models.Model):
    """
    Model representing sensor data.

    Fields:
    - company_sensor: The sensor data associated with the Company.
    - iot_device: The IOT device associated with the data.
    - company_id: The Company associated with the data.
    - timestamp: The timestamp of the data.
    - value: Actual data/value of the sensor send by the IOT device.

    """

    id = models.AutoField(db_column="id", primary_key=True)
    company_sensor = models.ForeignKey(
        CompanySensor,
        on_delete=models.PROTECT,
        db_column="company_sensor_id",
        db_constraint=False,
        related_name="company_sensor_data",
    )
    iot_device = models.ForeignKey(
        IotDevice,
        on_delete=models.PROTECT,
        db_column="iot_device_id",
        db_constraint=False,
        related_name="iot_device_data",
    )
    # Define to implement table partition in the Database
    company_id = models.ForeignKey(
        Company,
        on_delete=models.PROTECT,
        db_column="company_id",
        db_constraint=False,
        related_name="sensor_data",
    )
    timestamp = models.DateTimeField(db_column="timestamp", default=timezone.now)
    value = models.FloatField(db_column="value", blank=True, null=True)

    class Meta:
        unique_together = ("id", "company_id")
        ordering = ["timestamp", "iot_device"]
        db_table = "sensor_data_sensordata"
        managed = False
        indexes = [
            models.Index(fields=["company_id"]),
            models.Index(fields=["company_sensor"]),
            models.Index(fields=["iot_device_id"]),
            models.Index(fields=["timestamp"]),
        ]

    def __str__(self) -> str:
        return f"{self.company_sensor} - {self.iot_device.pk} - {self.value} - {self.timestamp}"
