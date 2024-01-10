from django.contrib import admin
from .models import SendLiveDataList

# Register your models here.


@admin.register(SendLiveDataList)
class SendLiveDataListAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "company",
        "user",
        "endpoints",
    )
