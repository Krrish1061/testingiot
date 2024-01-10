from django.db import models
from django.utils import timezone


from iot_devices.models import IotDevice
from sensors.models import AdminUserSensor, CompanySensor


class CompanySensorData(models.Model):
    """
    Model representing sensor data.
    later create a partition on the basis on timestamp

    Fields:
    - company_sensor: The sensor data associated with the Company.
    - iot_device: The IOT device associated with the data.
    - timestamp: The timestamp of the data.
    - value: Actual data/value of the sensor send by the IOT device.
    """

    company_sensor = models.ForeignKey(
        CompanySensor,
        on_delete=models.PROTECT,
        related_name="company_sensor_data",
    )

    iot_device = models.ForeignKey(
        IotDevice,
        on_delete=models.PROTECT,
        related_name="iot_device_company_data",
    )

    timestamp = models.DateTimeField(default=timezone.now)
    value = models.FloatField(blank=True, null=True)

    class Meta:
        ordering = ["timestamp", "iot_device"]

        indexes = [
            models.Index(fields=["timestamp"]),
        ]

    def __str__(self):
        return f"{self.company_sensor} - {self.iot_device.pk} - {self.value} - {self.timestamp}"


class AdminUserSensorData(models.Model):
    """
    Model representing sensor data. Storing data for the Individual customer.
    later create a partition on the basis on timestamp

    Fields:
    - user_sensor: The sensor data associated with the admin user.
    - iot_device: The IOT device associated with the data.
    - timestamp: The timestamp of the data.
    - value: Actual data/value of the sensor send by the IOT device.

    """

    user_sensor = models.ForeignKey(
        AdminUserSensor,
        on_delete=models.PROTECT,
        related_name="user_sensor_data",
    )

    iot_device = models.ForeignKey(
        IotDevice,
        on_delete=models.PROTECT,
        related_name="iot_device_admin_user_data",
    )

    timestamp = models.DateTimeField(default=timezone.now)
    value = models.FloatField(blank=True, null=True)

    class Meta:
        ordering = ["timestamp", "iot_device"]

        indexes = [
            models.Index(fields=["timestamp"]),
        ]

    def __str__(self):
        return f"{self.user_sensor} - {self.iot_device.pk} - {self.value} - {self.timestamp}"
