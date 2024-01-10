from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils.text import slugify
from company.cache import CompanyCache
from .models import Company, CompanyProfile


@receiver(pre_save, sender=Company)
def handling_slug(sender, instance, **kwargs):
    company = CompanyCache.get_company(instance.slug)
    if company is None:
        instance.slug = slugify(instance.name)  # Object is new,

    elif not company.name == instance.name:  # is the name field has changed
        instance.slug = slugify(instance.name)


@receiver(post_save, sender=Company)
def create_company_profile(sender, created, instance, **kwargs):
    if created:
        CompanyProfile.objects.create(company=instance)
