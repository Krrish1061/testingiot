from django.contrib import admin
from .models import CompanySensorData, AdminUserSensorData


# Register your models here.


@admin.register(CompanySensorData)
class SensorDataAdmin(admin.ModelAdmin):
    list_display = (
        "company_sensor",
        "iot_device",
        "value",
        "timestamp",
    )


@admin.register(AdminUserSensorData)
class SensorDataAdmin(admin.ModelAdmin):
    list_display = (
        "user_sensor",
        "iot_device",
        "value",
        "timestamp",
    )
