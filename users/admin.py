from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserAdditionalField, UserProfile
from .forms import UserChangeForm, UserCreationForm


# Register your models here.


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    form = UserChangeForm
    add_form = UserCreationForm

    list_display = [
        "email",
        "id",
        "company",
        "is_associated_with_company",
        "type",
        "is_staff",
        "is_active",
        "is_superuser",
        "api_key",
    ]
    list_filter = ["email", "is_staff", "is_active", "type"]
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (
            ("Personal info"),
            {
                "fields": (
                    "company",
                    "is_associated_with_company",
                )
            },
        ),
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
                    "password1",
                    "password2",
                    "type",
                    "company",
                    "is_associated_with_company",
                    "is_staff",
                    "is_active",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
    )
    search_fields = ("email", "company")
    ordering = ("email", "company")


@admin.register(UserAdditionalField)
class UserAdditionalFieldAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "created_by",
        "user_count",
        "user_limit",
    )


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "first_name",
        "last_name",
        "profile_picture",
        "facebook_profile",
        "linkedin_profile",
        "phone_number",
        "date_of_birth",
    )
