from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import UserProfile
from .utilis import generate_api_key
from django.conf import settings


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
        UserProfile.objects.create(user=instance)
