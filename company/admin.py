from django.contrib import admin
from .models import Company, CompanyProfile


# Register your models here.
@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "phone_number",
        "slug",
        "email",
        "address",
        "user_limit",
    )


@admin.register(CompanyProfile)
class CompanyProfileAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "company",
        "logo",
        "phone_number",
        "description",
    )
