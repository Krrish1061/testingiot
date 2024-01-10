import hashlib
import random
import string

from django.utils import timezone
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.conf import settings

from utils.constants import GroupName, UserType


def generate_api_key():
    """Generate a random API key."""
    api_key_length = 32
    api_key_chars = string.ascii_letters + string.digits
    return "".join(random.choices(api_key_chars, k=api_key_length))


def generate_unique_username():
    """Generate a username"""

    prefix = "user"

    # generating current year and month
    timestamp_component = timezone.now().strftime("%Y%m")

    # Generating a random integer (between 1000 and 9999) for uniqueness
    random_integer = random.randint(1000, 9999)

    return f"{prefix}{timestamp_component}{random_integer}"


def generate_user_auth_cache_key(api_key):
    # Use a secure hash function to generate a deterministic cache key
    return f"user:{hashlib.sha256(api_key.encode()).hexdigest()}"


def check_username(user, username, id=None):
    if (user.username != username) or (id and user.id != id):
        return False
    return True


def get_group_name(user_type):
    user_type_to_group_name = {
        UserType.ADMIN: GroupName.ADMIN_GROUP,
        UserType.MODERATOR: GroupName.MODERATOR_GROUP,
        UserType.VIEWER: GroupName.VIEWER_GROUP,
    }

    return user_type_to_group_name.get(user_type)


# class TokenGenerator(PasswordResetTokenGenerator):
#     def __init__(self, timeout):
#         # timeout is equal to  datetime in seconds that the token is valid
#         super().__init__()
#         self.timeout = timeout

#     def _make_hash_value(self, user, timestamp):
#         # initally timestamp is equal to current time
#         # validation is done by checking timestamp with the settings.PASSWORD_RESET_TIMEOUT default is 3 days
#         # to validate a token for a 1 day we will add 2 days to current time such that settings.PASSWORD_RESET_TIMEOUT - timestamp = 1 day
#         print("before", timestamp)
#         timestamp = timestamp - (settings.PASSWORD_RESET_TIMEOUT - self.timeout)
#         print(timestamp)
#         return super()._make_hash_value(user, timestamp)


class TokenGenerator(PasswordResetTokenGenerator):
    def __init__(self, timeout=None):
        # timeout is equal to datetime in seconds that the token is valid
        super().__init__()
        self.timeout = timeout

    def make_token(self, user):
        """
        Return a token that can be used once to do a password reset
        for the given user with a custom timeout.
        """
        timestamp = (
            self._num_seconds(self._now())
            - (settings.PASSWORD_RESET_TIMEOUT - self.timeout)
            if self.timeout
            else self._num_seconds(self._now())
        )
        return self._make_token_with_timestamp(user, timestamp, self.secret)


# for email token is valid for 3 days
activation_token_for_email = TokenGenerator()

# for password reset token is valid for 86400 sec i.e 1 day or 24hr
activation_token_for_password_reset = TokenGenerator(86400)
