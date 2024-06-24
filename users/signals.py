from django.conf import settings
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from users.models.user_models import UserProfile
from users.tasks import sending_verify_email

from .utilis import generate_unique_username


@receiver(pre_save, sender=settings.AUTH_USER_MODEL)
def get_username(sender, instance, *args, **kwargs):
    if not instance.username:
        username = generate_unique_username()
        while sender.objects.filter(username=username).exists():
            username = generate_unique_username()

        instance.username = username


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def handle_user_registered(sender, created, instance, *args, **kwargs):
    if created:
        # creating the profile for the new user
        UserProfile.objects.create(user=instance)

        # calling celery task to send to send veirification email to the new user
        sending_verify_email.delay(instance.username)
