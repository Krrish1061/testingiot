from django.core.validators import URLValidator
from django.core.exceptions import ValidationError


def validate_urls(urls: list[str]):
    url_validator = URLValidator()
    for url in urls:
        try:
            url_validator(url)
        except ValidationError:
            raise ValidationError(f"Invalid url: '{url}'")
