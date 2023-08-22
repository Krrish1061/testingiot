from django.db import models
from django.utils.text import slugify
from django.urls import reverse

from users.validators import validate_file_size


# Create your models here.
class Company(models.Model):
    name = models.CharField(max_length=250, unique=True)
    slug = models.SlugField(max_length=50, unique=True, blank=True)
    address = models.CharField(max_length=250)
    email = models.EmailField(max_length=255, unique=True, null=True)
    user_limit = models.PositiveIntegerField(default=5)
    # add description

    def __str__(self):
        return self.name

    # def get_absolute_url(self):
    #     kwargs = {
    #         "pk": self.id,
    #         "slug": self.slug,
    #     }
    #     return reverse("company-detail", kwargs=kwargs)


# Create your models here.
class CompanyProfile(models.Model):
    company = models.OneToOneField(
        Company, on_delete=models.CASCADE, related_name="company_profile"
    )
    logo = models.ImageField(
        upload_to="company/logo/",
        validators=[validate_file_size],
        blank=True,
        null=True,
    )
    contact_phone = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"Profile of {self.company.name}"
