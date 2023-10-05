import hashlib
import random
import string

from django.utils import timezone


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
