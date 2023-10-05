from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator

from utils.error_message import (
    ERROR_ONLY_ALPHANUMERIC_CHARACTER_ARE_ALLOWED,
    error_image_file_size_limit_reached,
)


def validate_file_size(file):
    max_size_kb = 5000
    # max_size_kb size is in bytes

    if file.size > max_size_kb * 1024:
        raise ValidationError(error_image_file_size_limit_reached(max_size_kb))


alphanumeric_validator = RegexValidator(
    r"^[a-zA-Z0-9]*$",
    ERROR_ONLY_ALPHANUMERIC_CHARACTER_ARE_ALLOWED,
    "invalid",
)
