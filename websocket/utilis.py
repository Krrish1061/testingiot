import hashlib
import random
import string


def generate_token_key():
    choices = string.ascii_letters + string.digits
    token_key = "".join(random.choice(choices) for _ in range(15))
    return hashlib.sha1(token_key.encode("utf-8")).hexdigest()
