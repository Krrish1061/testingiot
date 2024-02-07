from django.core.validators import URLValidator
from django.core.exceptions import ValidationError


def validate_urls(url: str):
    url_validator = URLValidator()
    try:
        url_validator(url)
    except ValidationError:
        raise ValidationError(f"Invalid url: '{url}'")
