from django.contrib import admin
from .models import Sensor, CompanySensor, AdminUserSensor


# Register your models here.
@admin.register(Sensor)
class SensorAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "value_type",
        "unit",
        "symbol",
    )


@admin.register(CompanySensor)
class CompanySensorAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "company",
        "sensor",
        "field_name",
    )


@admin.register(AdminUserSensor)
class AdminUserSensorAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "sensor",
        "field_name",
    )
