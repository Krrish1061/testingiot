from django.contrib.auth.forms import (
    UserCreationForm as BaseUserCreationForm,
    UserChangeForm as BaseUserChangeForm,
)
from django import forms
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from django.core.exceptions import ValidationError
from .models import AdminUserExtraField, User


class UserCreationForm(BaseUserCreationForm):
    """A form for creating new users. Includes all the required
    fields, plus a repeated password."""

    password1 = forms.CharField(label="Password", widget=forms.PasswordInput)
    password2 = forms.CharField(
        label="Password confirmation", widget=forms.PasswordInput
    )
    company_name = forms.CharField(
        max_length=50,
        help_text="Add only if type is admin otherwise error will occur and Company name will be used as a MYSQL Table partition name for the admin User",
    )
    create_partition = forms.BooleanField(
        help_text="Add only if type is admin otherwise error will occur",
    )

    class Meta:
        model = User
        fields = ("email", "first_name", "last_name", "is_staff", "is_active", "type")

    def clean_password2(self):
        # Check that the two password entries match
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise ValidationError("Passwords don't match")
        return password2

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        user.save()
        if self.cleaned_data["type"] == "ADMIN":
            admin_user_extra = AdminUserExtraField(
                admin_user=user,
                company_name=self.cleaned_data["company_name"],
                create_partition=self.cleaned_data["create_partition"],
            )
            admin_user_extra.save()
        return user


class UserChangeForm(BaseUserChangeForm):
    password = ReadOnlyPasswordHashField()

    class Meta:
        model = User
        fields = ("email", "first_name", "last_name", "is_staff", "is_active", "type")
