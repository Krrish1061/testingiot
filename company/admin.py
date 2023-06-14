from django.contrib import admin
from .models import Company
from .forms import CompanyChangeForm, CompanyCreationForm

# Register your models here.


class CompanyAdmin(admin.ModelAdmin):
    form = CompanyChangeForm
    add_form = CompanyCreationForm
    list_display = ("name", "id", "slug", "address", "user_limit", "create_partition")


admin.site.register(Company, CompanyAdmin)
