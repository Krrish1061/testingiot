from django.db import models
from django.utils import timezone
from users.validators import validate_file_size
from django.core.validators import RegexValidator
from utils.error_message import ERROR_PHONE_NUMBER


# Create your models here.
class Company(models.Model):
    """
    Company model representing company in the system.
    """

    name = models.CharField(max_length=250, unique=True)
    email = models.EmailField(max_length=255, unique=True)
    slug = models.SlugField(max_length=50, unique=True, blank=True)
    user_limit = models.PositiveSmallIntegerField(default=5, blank=True)
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    api_key = models.CharField(
        verbose_name="Company Authentication Api key",
        max_length=32,
        unique=True,
        null=True,
        blank=True,
    )

    def __str__(self):
        return self.slug

    class Meta:
        indexes = [
            models.Index(fields=["name"]),
            models.Index(fields=["email"]),
            models.Index(fields=["slug"]),
        ]

    def save(self, *args, **kwargs):
        self.name = self.name.lower()
        return super().save(*args, **kwargs)


class CompanyProfile(models.Model):
    """
    Model representing company profile in the system.
    """

    company = models.OneToOneField(
        Company, on_delete=models.CASCADE, related_name="profile"
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
        return f"Profile of {self.company.name}"
