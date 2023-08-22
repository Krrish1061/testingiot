from django.contrib import admin
from .models import IotDevice


# Register your models here.
@admin.register(IotDevice)
class IotDeviceAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "company",
        "user",
        "iot_device_location",
        "is_active",
        "api_key",
    )
