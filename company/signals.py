from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils.text import slugify
from caching.cache import Cache
from caching.cache_key import get_company_profile_cache_key
from .models import Company, CompanyProfile
from caching.cache_key import (
    COMPANY_LIST_CACHE_KEY,
    get_company_profile_cache_key,
)

from .utils import get_company


@receiver(pre_save, sender=Company)
def handling_slug(sender, instance, **kwargs):
    try:
        company = Cache.get_from_list(COMPANY_LIST_CACHE_KEY, instance.pk)
        if company is None:
            company = sender.objects.get(pk=instance.pk)
    except sender.DoesNotExist:
        instance.slug = slugify(
            instance.name
        )  # Object is new, so field hasn't technically changed, but you may want to do something else here.

    else:
        if not company.name == instance.name:  # Field has changed
            instance.slug = slugify(instance.name)


@receiver(post_save, sender=Company)
def create_company_profile(sender, created, instance, *args, **kwargs):
    if created:
        company_profile = CompanyProfile.objects.create(company=instance)
        Cache.set(get_company_profile_cache_key(instance.slug), company_profile)
