from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, AdminUserExtraField as UserExtraField
from .forms import UserChangeForm, UserCreationForm
from django import forms


# Register your models here.


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    form = UserChangeForm
    add_form = UserCreationForm

    list_display = [
        "email",
        "id",
        "first_name",
        "last_name",
        "company",
        "type",
        "is_staff",
        "is_active",
        "is_superuser",
        "api_key",
    ]
    list_filter = ["email", "is_staff", "is_active", "type"]
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (("Personal info"), {"fields": ("first_name", "last_name", "company")}),
        (
            "Permissions",
            {
                "fields": (
                    "is_staff",
                    "is_active",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        (("User Type"), {"fields": ("type",)}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "first_name",
                    "last_name",
                    "password1",
                    "password2",
                    "type",
                    "company",
                    "company_name",
                    "create_partition",
                    "is_staff",
                    "is_active",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
    )
    search_fields = ("email",)
    ordering = ("email",)


# admin.site.register(AdminUserExtraField)
@admin.register(UserExtraField)
class AdminUserExtraField(admin.ModelAdmin):
    list_display = ["admin_user", "company_name", "create_partition"]
    fieldsets = (
        ((None, {"fields": ("admin_user", "company_name", "create_partition")})),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "admin_user",
                    "create_partition",
                    "company_name",
                ),
            },
        ),
    )
