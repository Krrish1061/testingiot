from django.db.models.signals import post_save
from django.dispatch import receiver

from users.utilis import generate_api_key

from .models import IotDevice


@receiver(post_save, sender=IotDevice)
def Iot_device_auth_generator(sender, created, instance, *args, **kwargs):
    if created:
        api_key = ""
        while sender.objects.filter(api_key=api_key).exists() or api_key == "":
            api_key = generate_api_key()
        instance.api_key = api_key
        instance.save()
