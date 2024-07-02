from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils.text import slugify

from company.cache import CompanyCache
from users.cache import UserCache
from users.tasks import sending_verify_email
from utils.constants import GroupName, UserType

from .models import Company, CompanyProfile

User = get_user_model()


@receiver(pre_save, sender=Company)
def handling_slug(sender, instance, **kwargs):
    company = CompanyCache.get_company(instance.slug)
    if company is None:
        instance.slug = slugify(instance.name)  # Object is new,

    elif not company.name == instance.name:  # is the name field has changed
        instance.slug = slugify(instance.name)
        CompanyCache.clear()


@receiver(post_save, sender=Company)
def create_company_profile(sender, created, instance, **kwargs):
    if created:
        CompanyProfile.objects.create(company=instance)


@receiver(post_save, sender=Company)
def handling_company_superadmin_user(sender, instance, created, **kwargs):
    if created:
        company_superadmin_user = User.objects.create_user(
            email=instance.email,
            type=UserType.ADMIN,
            company=instance,
        )
        company_superadmin_group = Group.objects.get(
            name=GroupName.COMPANY_SUPERADMIN_GROUP
        )
        company_superadmin_user.groups.add(company_superadmin_group)
        company_superadmin_user.set_unusable_password()
        company_superadmin_user.save()
        # setting new user into cache
        UserCache.set_user(company_superadmin_user)
        instance.user = company_superadmin_user
        instance.save(update_fields=["user"])
        # calling celery task to send verification email
        sending_verify_email.delay(company_superadmin_user.username)
