from django.contrib import admin
from .models import Sensor


# Register your models here.
@admin.register(Sensor)
class SensorAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "unit",
        "symbol",
        "max_limit",
        "min_limit",
        "is_value_boolean",
    )
