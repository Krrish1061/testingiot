from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .forms import UserChangeForm, UserCreationForm
from users.models.user_models import User, UserProfile


# Register your models here.
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    form = UserChangeForm
    add_form = UserCreationForm

    list_display = [
        "id",
        "email",
        "username",
        "company",
        "dealer",
        "is_associated_with_company",
        "type",
        "is_staff",
        "is_active",
        "is_superuser",
        "created_by",
        "user_limit",
        "api_key",
    ]
    list_filter = ["email", "is_staff", "is_active", "type", "created_by"]
    fieldsets = (
        (None, {"fields": ("email", "password", "username")}),
        (
            ("Personal info"),
            {
                "fields": (
                    "company",
                    "dealer",
                    "is_associated_with_company",
                    "created_by",
                    "user_limit",
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
                    "username",
                    "password1",
                    "password2",
                    "type",
                    "company",
                    "dealer",
                    "is_associated_with_company",
                    "created_by",
                    "user_limit",
                    "is_staff",
                    "is_active",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
    )
    search_fields = (
        "email",
        "company",
        "username",
    )
    ordering = (
        "email",
        "company",
        "username",
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
        "address",
        "email_change_to",
    )
