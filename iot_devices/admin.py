from django.contrib import admin
from .models import IotDevice, IotDeviceSensor, IotDeviceDetail


# Register your models here.
@admin.register(IotDevice)
class IotDeviceAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "company",
        "user",
        "dealer",
        "board_id",
        "is_active",
        "api_key",
    )


@admin.register(IotDeviceSensor)
class IotDeviceSensorAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "iot_device",
        "sensor",
        "field_name",
        "field_number",
        "max_limit",
        "min_limit",
    )


@admin.register(IotDeviceDetail)
class IotDeviceDetailAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "iot_device",
        "environment_type",
        "address",
        "description",
    )
