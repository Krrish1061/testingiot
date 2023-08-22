from django.core.exceptions import ValidationError


def validate_file_size(file):
    max_size_kb = 5000
    # max_size_kb size is in bytes

    if file.size > max_size_kb * 1024:
        raise ValidationError(f"Image file cannot be larger than {max_size_kb} KB ")
