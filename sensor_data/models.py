from django.db import models
from django.utils import timezone
from users.models import AdminUser


# Create your models here.
class IotDevice(models.Model):
    """
    Model representing an IOT device.

    Fields:
    - user: The admin user who owns the iot device.
    - iot_device_id: The unique identifier of the device.
    - iot_device_location: The location of the device.
    - is_active: Flag indicating if the device is active.

    """

    user = models.ForeignKey(
        AdminUser, on_delete=models.CASCADE, related_name="iot_device_list"
    )
    iot_device_id = models.PositiveIntegerField(primary_key=True, unique=True)
    iot_device_location = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.BooleanField(default=True, blank=True)

    def __str__(self) -> str:
        return str(self.iot_device_id)

    class Meta:
        ordering = ["iot_device_id"]
        unique_together = ["user", "iot_device_id"]
        indexes = [models.Index(fields=["user", "iot_device_id"])]


class Sensor(models.Model):
    """
    Model representing a sensor.

    Fields:
    - name: The name of the sensor.
    - value_type: The type of the sensor value.
    - unit: The unit of measurement for the sensor value.

    """

    name = models.CharField(max_length=255)
    value_type = models.CharField(max_length=150)
    unit = models.CharField(max_length=150)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["name"]
        unique_together = ["name"]
        indexes = [models.Index(fields=["name"])]


class AdminSensor(models.Model):
    """
    Model representing a sensor associated with an admin user.

    Fields:
    - user: The admin user who owns the sensor.
    - sensor: The sensor associated with the admin user.
    - field_name: The name of the field for the sensor.

    """

    user = models.ForeignKey(
        AdminUser, on_delete=models.CASCADE, related_name="sensor_list"
    )
    sensor = models.ForeignKey(
        Sensor, on_delete=models.CASCADE, related_name="sensor_name"
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


class SensorData(models.Model):
    """
    Model representing sensor data.

    Fields:
    - admin_user_sensor: The admin sensor associated with the data.
    - iot_device: The IOT device associated with the data.
    - admin_user_id: The admin user associated with the data.
    - timestamp: The timestamp of the data.
    - value: The value of the sensor data.

    """

    id = models.AutoField(db_column="id", primary_key=True)
    admin_user_sensor = models.ForeignKey(
        AdminSensor,
        on_delete=models.CASCADE,
        db_column="admin_sensor_id",
        db_constraint=False,
        related_name="admin_data_list",
    )
    iot_device = models.ForeignKey(
        IotDevice,
        on_delete=models.CASCADE,
        db_column="iot_device_id",
        db_constraint=False,
        related_name="device_data_list",
    )
    admin_user_id = models.ForeignKey(
        AdminUser,
        on_delete=models.CASCADE,
        db_column="admin_user_id",
        db_constraint=False,
        related_name="sensor_data_list",
    )
    timestamp = models.DateTimeField(db_column="timestamp", default=timezone.now)
    value = models.FloatField(db_column="value", blank=True, null=True)

    class Meta:
        unique_together = ("id", "admin_user_id")
        ordering = ["timestamp", "iot_device"]
        db_table = "sensor_data_sensordata"
        managed = False
        indexes = [
            models.Index(fields=["admin_user_id"]),
            models.Index(fields=["admin_user_sensor"]),
            models.Index(fields=["iot_device_id"]),
            models.Index(fields=["timestamp"]),
        ]

    def __str__(self) -> str:
        return f"{self.admin_user_sensor} - {self.iot_device} - {self.value} - {self.timestamp}"
