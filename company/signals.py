from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils.text import slugify

from .models import Company, CompanyProfile


@receiver(post_save, sender=Company)
def create_company_profile(sender, created, instance, *args, **kwargs):
    if created:
        CompanyProfile.objects.create(company=instance)


@receiver(pre_save, sender=Company)
def handling_slug(sender, instance, **kwargs):
    try:
        obj = sender.objects.get(pk=instance.pk)
    except sender.DoesNotExist:
        instance.slug = slugify(
            instance.name
        )  # Object is new, so field hasn't technically changed, but you may want to do something else here.

    else:
        if not obj.name == instance.name:  # Field has changed
            instance.slug = slugify(instance.name)
