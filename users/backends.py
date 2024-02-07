from django.contrib.auth.backends import BaseBackend
from django.db.models import Q

from .exceptions import InActiveUserException
from .models import User


class EmailorUsernameModelBackend(BaseBackend):
    """
    This is a ModelBacked that allows authentication with either a username or an email address.

    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        # Check the username/password and return a user.
        # if "@" in username:
        #     kwargs = {"email": username}
        # else:
        #     kwargs = {"username": username}
        try:
            user = (
                User.objects.select_related("company")
                .prefetch_related("groups")
                .get(Q(username=username) | Q(email=username))
            )
        except User.DoesNotExist:
            return None
        else:
            if user.check_password(password) and self.user_can_authenticate(user):
                return user

    def user_can_authenticate(self, user):
        """
        Reject users with is_active=False. Custom user models that don't have
        that attribute are allowed.
        """
        is_active = getattr(user, "is_active")
        if not is_active:
            raise InActiveUserException()
        return is_active

    def get_user(self, user_id):
        try:
            return (
                User.objects.select_related("company", "created_by")
                .prefetch_related("groups")
                .get(pk=user_id)
            )
        except User.DoesNotExist:
            return None
