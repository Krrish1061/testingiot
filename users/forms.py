from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from django.contrib.auth.forms import UserChangeForm as BaseUserChangeForm
from django.contrib.auth.forms import UserCreationForm as BaseUserCreationForm
from django.core.exceptions import ValidationError

User = get_user_model()


class UserCreationForm(BaseUserCreationForm):
    """A form for creating new users. Includes all the required
    fields, plus a repeated password."""

    password1 = forms.CharField(
        label="Password", widget=forms.PasswordInput, required=False
    )
    password2 = forms.CharField(
        label="Password confirmation", widget=forms.PasswordInput, required=False
    )

    class Meta:
        model = User
        fields = ("email", "is_staff", "is_active", "type")

    def clean_password2(self):
        # Check that the two password entries match
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise ValidationError("Passwords don't match")
        return password2

    def save(self, commit=True):
        user = super().save(commit=False)
        if self.cleaned_data["password1"]:
            user.set_password(self.cleaned_data["password1"])
        else:
            user.set_unusable_password()
        user.save()
        return user


class UserChangeForm(BaseUserChangeForm):
    password = ReadOnlyPasswordHashField()

    class Meta:
        model = User
        fields = ("email", "is_staff", "is_active", "type")
