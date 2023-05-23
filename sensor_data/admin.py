from django.contrib import admin
from .models import (
    IotDevice,
    Sensor,
    AdminSensor,
    SensorData,
)


# Register your models here.
@admin.register(IotDevice)
class IotDeviceAdmin(admin.ModelAdmin):
    list_display = (
        "user",
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


@admin.register(AdminSensor)
class AdminUserSensorAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "sensor",
        "field_name",
    )


@admin.register(SensorData)
class SensorDataAdmin(admin.ModelAdmin):
    list_display = (
        "admin_user_sensor",
        "admin_user_id",
        "iot_device",
        "value",
        "timestamp",
    )
