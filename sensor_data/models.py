from django.db import models
from django.utils import timezone
from iot_devices.models import IotDevice, IotDeviceSensor


class SensorData(models.Model):
    """
    Model representing sensor data.
    later create a partition on the basis on timestamp

    Fields:
    - device_sensor: The sensor data associated with the device sensor.
    - iot_device: The IOT device associated with the data.
    - timestamp: The timestamp of the data.
    - value: Actual data/value of the sensor send by the IOT device.
    """

    device_sensor = models.ForeignKey(
        IotDeviceSensor,
        on_delete=models.PROTECT,
        related_name="device_sensor_data",
    )

    iot_device = models.ForeignKey(
        IotDevice,
        on_delete=models.PROTECT,
        related_name="iot_device_data",
    )

    timestamp = models.DateTimeField(default=timezone.now)
    value = models.FloatField(blank=True, null=True)

    class Meta:
        ordering = ["-timestamp", "iot_device"]

        indexes = [
            models.Index(fields=["timestamp"]),
        ]

    def __str__(self):
        return f"sensor data of device_sensor id {self.device_sensor.id}"
