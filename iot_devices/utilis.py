import hashlib


def generate_auth_cache_key(api_key):
    # Use a secure hash function to generate a deterministic cache key
    return f"iot_device:{hashlib.sha256(api_key.encode()).hexdigest()}"
