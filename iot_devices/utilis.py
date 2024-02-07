import hashlib


# from functools import lru_cache


# later use other means such as hasing algorithm md5 SHA-1
# @lru_cache(maxsize=None) memeorize the function result
def generate_auth_cache_key(api_key):
    # Use a secure hash function to generate a deterministic cache key
    return f"iot_device:{hashlib.sha256(api_key.encode()).hexdigest()}"
