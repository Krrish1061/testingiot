from django.contrib import admin
from .models import Company

# Register your models here.


@admin.register(Company)
class IotDeviceAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "id",
        "slug",
        "address",
        "user_limit",
    )
