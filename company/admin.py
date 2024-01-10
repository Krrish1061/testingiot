from django.contrib import admin
from .models import Company, CompanyProfile


# Register your models here.
@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "slug",
        "email",
        "user_limit",
        "api_key",
    )


@admin.register(CompanyProfile)
class CompanyProfileAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "company",
        "logo",
        "address",
        "phone_number",
        "description",
    )
