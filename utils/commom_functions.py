import random
import string


def get_groups_tuple(user):
    return tuple(group.name for group in user.groups.all())


def generate_api_key():
    """Generate a random API key."""
    api_key_length = 32
    api_key_chars = string.ascii_letters + string.digits
    return "".join(random.choices(api_key_chars, k=api_key_length))
