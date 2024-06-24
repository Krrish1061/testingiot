from django.contrib import admin
from .models import Dealer, DealerProfile


# Register your models here.
@admin.register(Dealer)
class DealerAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "name",
        "email",
        "slug",
        "user_company_limit",
    )


@admin.register(DealerProfile)
class DealerAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "dealer",
        "logo",
        "address",
        "phone_number",
        "description",
    )
