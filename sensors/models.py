from django.db import models
from django.utils import timezone


class Sensor(models.Model):
    """
    Model representing a sensor.

    Fields:
    - name: The name of the sensor.
    - unit: The unit of measurement for the sensor value.
    - symbol: symbol of the sensor
    - created_at: Date and Time Sensor is created
    - max_limit: Sensor max value it can measure
    - min_limit: Senaor min value it can measure

    """

    name = models.CharField(max_length=255, unique=True)
    unit = models.CharField(max_length=100, null=True, blank=True)
    symbol = models.CharField(max_length=10, null=True, blank=True)
    max_limit = models.IntegerField(blank=True, null=True)
    min_limit = models.IntegerField(blank=True, null=True)
    is_value_boolean = models.BooleanField(default=False, blank=True)
    created_at = models.DateTimeField(default=timezone.now, editable=False)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        self.name = self.name.lower()
        return super().save(*args, **kwargs)

    class Meta:
        ordering = ["name"]
        indexes = [models.Index(fields=["name"])]
