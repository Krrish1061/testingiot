from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils.text import slugify

from dealer.cache import DealerCache
from users.cache import UserCache
from users.tasks import sending_verify_email
from utils.constants import GroupName, UserType

from .models import Dealer, DealerProfile

User = get_user_model()


@receiver(pre_save, sender=Dealer)
def handling_slug(sender, instance, **kwargs):
    dealer = DealerCache.get_dealer(instance.slug)
    if dealer is None:
        instance.slug = slugify(instance.name)  # Object is new,

    elif not dealer.name == instance.name:  # is the name field has changed
        instance.slug = slugify(instance.name)
        # clear the all the cache
        DealerCache.clear()


@receiver(post_save, sender=Dealer)
def create_dealer_profile(sender, created, instance, **kwargs):
    if created:
        DealerProfile.objects.create(dealer=instance)


@receiver(post_save, sender=Dealer)
def handling_dealer_user(sender, instance, created, **kwargs):
    if created:
        dealeruser = User.objects.create_user(
            email=instance.email,
            type=UserType.ADMIN,
            dealer=instance,
        )
        dealer_group = Group.objects.get(name=GroupName.DEALER_GROUP)
        dealeruser.groups.add(dealer_group)
        dealeruser.set_unusable_password()
        dealeruser.save()
        # setting new user into cache
        UserCache.set_user(dealeruser)
        instance.user = dealeruser
        instance.save(update_fields=["user"])
        # calling celery task to send verification email
        sending_verify_email.delay(dealeruser.username)
