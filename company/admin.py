from django.contrib import admin
from .models import Company, CompanyProfile

# from .forms import CompanyChangeForm, CompanyCreationForm

# Register your models here.


# class CompanyAdmin(admin.ModelAdmin):
#     form = CompanyChangeForm
#     add_form = CompanyCreationForm
#     list_display = ("name", "id", "slug", "address", "user_limit", "create_partition")
# admin.site.register(Company, CompanyAdmin)


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "slug",
        "address",
        "user_limit",
    )


@admin.register(CompanyProfile)
class CompanyProfileAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "company",
        "logo",
        "contact_phone",
    )
