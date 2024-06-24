from typing import Any
from django.core.validators import RegexValidator
from django.db import models
from django.utils import timezone
from users.validators import validate_file_size
from utils.error_message import ERROR_PHONE_NUMBER


# Create your models here.
class Dealer(models.Model):
    """
    Dealer model representing Dealer in the system.
    """

    user = models.OneToOneField(
        "users.DealerUser",
        on_delete=models.SET_NULL,
        related_name="dealer_profile",
        blank=True,
        null=True,
    )
    name = models.CharField(max_length=255, unique=True)
    email = models.EmailField(verbose_name="email address", max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    user_company_limit = models.PositiveSmallIntegerField(
        default=5, blank=True, null=True
    )
    created_by = models.ForeignKey(
        "users.User",
        on_delete=models.SET_NULL,
        related_name="dealer_created_by",
        blank=True,
        null=True,
    )

    def __str__(self):
        """Returns the string representation of the Dealer model"""
        return self.slug

    class Meta:
        indexes = [
            models.Index(fields=["name"]),
            models.Index(fields=["email"]),
            models.Index(fields=["slug"]),
        ]


class DealerProfile(models.Model):
    """
    Model representing Dealer profile in the system
    """

    dealer = models.OneToOneField(
        Dealer, on_delete=models.CASCADE, related_name="profile"
    )
    logo = models.ImageField(
        upload_to="company/logo/",
        validators=[validate_file_size],
        blank=True,
        null=True,
    )
    phone_number = models.CharField(
        max_length=10,
        validators=[
            RegexValidator(
                regex=r"^[0-9]{10}$",
                message=ERROR_PHONE_NUMBER,
            ),
        ],
        blank=True,
        null=True,
    )
    address = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Profile of {self.dealer.name}"
