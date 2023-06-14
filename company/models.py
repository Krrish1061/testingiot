from django.db import models
from django.utils.text import slugify


# Create your models here.
class Company(models.Model):
    name = models.CharField(max_length=250, unique=True)
    #  prevent changing the slug even if the company name is changed
    slug = models.SlugField(max_length=50, unique=True, blank=True)
    address = models.CharField(max_length=250)
    contact_email = models.EmailField(max_length=255)
    contact_phone = models.CharField(max_length=20)
    user_limit = models.PositiveIntegerField(default=5)
    create_partition = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
