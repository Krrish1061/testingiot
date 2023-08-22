from django.db import models
from django.utils import timezone
from company.models import Company
from iot_devices.models import IotDevice
from django.core.exceptions import ValidationError
from sensors.models import CompanySensor, AdminUserSensor


# class SensorData(models.Model):
#     """
#     Model representing sensor data.
#     Table is not managed by the django. Table need to be created personally in the database with the field below specified

#     create a partition on the basis on timestamp

#     Fields:
#     - company_sensor: The sensor data associated with the Company.
#     - iot_device: The IOT device associated with the data.
#     - company_id: The Company associated with the data.
#     - timestamp: The timestamp of the data.
#     - value: Actual data/value of the sensor send by the IOT device.

#     """

#     id = models.AutoField(db_column="id", primary_key=True)
#     company_sensor = models.ForeignKey(
#         CompanySensor,
#         on_delete=models.PROTECT,
#         db_column="company_sensor_id",
#         db_constraint=False,
#         related_name="company_sensor_data",
#     )
#     iot_device = models.ForeignKey(
#         IotDevice,
#         on_delete=models.PROTECT,
#         db_column="iot_device_id",
#         db_constraint=False,
#         related_name="iot_device_data",
#     )
#     # Define to implement table partition in the Database
#     company_id = models.ForeignKey(
#         Company,
#         on_delete=models.PROTECT,
#         db_column="company_id",
#         db_constraint=False,
#         related_name="sensor_data",
#     )
#     timestamp = models.DateTimeField(db_column="timestamp", default=timezone.now)
#     value = models.FloatField(db_column="value", blank=True, null=True)

#     class Meta:
#         unique_together = ("id", "company_id")
#         ordering = ["timestamp", "iot_device"]
#         db_table = "sensor_data_sensordata"
#         managed = False
#         indexes = [
#             models.Index(fields=["company_id"]),
#             models.Index(fields=["company_sensor"]),
#             models.Index(fields=["iot_device_id"]),
#             models.Index(fields=["timestamp"]),
#         ]

#     def __str__(self) -> str:
#         return f"{self.company_sensor} - {self.iot_device.pk} - {self.value} - {self.timestamp}"


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
            models.Index(fields=["company_sensor"]),
            models.Index(fields=["iot_device"]),
            models.Index(fields=["timestamp"]),
        ]

    def __str__(self):
        return f"{self.company_sensor} - {self.iot_device.pk} - {self.value} - {self.timestamp}"


class AdminUserSensorData(models.Model):
    """
    Model representing sensor data.
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
            models.Index(fields=["user_sensor"]),
            models.Index(fields=["iot_device"]),
            models.Index(fields=["timestamp"]),
        ]

    def __str__(self):
        return f"{self.user_sensor} - {self.iot_device.pk} - {self.value} - {self.timestamp}"
