from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from caching.cache import Cache
from caching.cache_key import get_user_profile_cache_key
from .models import UserProfile
from .utilis import generate_api_key, generate_unique_username
from django.conf import settings


@receiver(pre_save, sender=settings.AUTH_USER_MODEL)
def get_username(sender, instance, *args, **kwargs):
    if not instance.username:
        username = generate_unique_username()
        while sender.objects.filter(username=username).exists():
            username = generate_api_key()

        instance.username = username


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def handle_user_registered(sender, created, instance, *args, **kwargs):
    # make sure api key are generated for the admin user created by the superadmin only

    if created:
        # and instance.type == "ADMIN":
        api_key = ""
        while sender.objects.filter(api_key=api_key).exists() or api_key == "":
            api_key = generate_api_key()
        instance.api_key = api_key
        instance.save()

    if created:
        user_profile = UserProfile.objects.create(user=instance)
        cache_key = get_user_profile_cache_key(instance.username)
        Cache.set(cache_key, user_profile)
