from django.contrib import admin
from .models import (
    IotDevice,
    Sensor,
    CompanySensor,
    SensorData,
)


# Register your models here.
@admin.register(IotDevice)
class IotDeviceAdmin(admin.ModelAdmin):
    list_display = (
        "company",
        "iot_device_id",
        "iot_device_location",
        "is_active",
    )


@admin.register(Sensor)
class SensorAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "value_type",
        "unit",
    )


@admin.register(CompanySensor)
class AdminUserSensorAdmin(admin.ModelAdmin):
    list_display = (
        "company",
        "sensor",
        "field_name",
    )


@admin.register(SensorData)
class SensorDataAdmin(admin.ModelAdmin):
    list_display = (
        "company_sensor",
        "company_id",
        "iot_device",
        "value",
        "timestamp",
    )
