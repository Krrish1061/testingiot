from django.db.models.signals import pre_save
from django.dispatch import receiver
from .utilis import generate_api_key
from django.conf import settings


@receiver(pre_save, sender=settings.AUTH_USER_MODEL)
def handle_user_registered(sender, instance, **kwargs):
    if instance.type == "ADMIN":
        api_key = ""
        while sender.objects.filter(api_key=api_key).exists() or api_key == "":
            api_key = generate_api_key()
        instance.api_key = api_key
