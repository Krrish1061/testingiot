from django.db.models.signals import pre_save, post_save, pre_delete
from django.dispatch import receiver
from django.utils.text import slugify
from dealer.cache import DealerCache
from users.cache import UserCache
from utils.constants import GroupName, UserType
from django.contrib.auth.models import Group
from .models import Dealer, DealerProfile
from django.contrib.auth import get_user_model

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


# @receiver(pre_save, sender=Dealer)
# def handling_user(sender, instance, **kwargs):
#     dealer = DealerCache.get_dealer(instance.slug)
#     if dealer is None:
#         dealeruser = User.objects.create_user(email=instance.email, type=UserType.ADMIN)
#         dealeruser.set_unusable_password()
#         dealer_group = Group.objects.get(name=GroupName.DEALER_GROUP)
#         dealeruser.groups.add(dealer_group)
#         # setting new user into cache
#         UserCache.set_user(dealeruser)
#         instance.user = dealeruser


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


# @receiver(pre_delete, sender=Dealer)
# def delete_associated_dealeruser(sender, instance, **kwargs):
#     print("deleting user 1")
#     if instance.user:
#         print("deleting user")
#         instance.user.delete()
