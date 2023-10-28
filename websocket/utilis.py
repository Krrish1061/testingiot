import hashlib
import random
import string


def generate_token_key():
    choices = string.ascii_letters + string.digits
    return "".join(random.choice(choices) for _ in range(15))
