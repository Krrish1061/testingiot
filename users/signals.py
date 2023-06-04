from django.db.models.signals import post_save
from django.dispatch import receiver
from .utilis import generate_api_key
from django.conf import settings


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def handle_user_registered(sender, created, instance, **kwargs):
    # mske sure api key are generated for the admin user created by the superadmin only
    if created:
        # and instance.type == "ADMIN": implement it after testing
        api_key = ""
        while sender.objects.filter(api_key=api_key).exists() or api_key == "":
            api_key = generate_api_key()
        instance.api_key = api_key
        instance.save()
