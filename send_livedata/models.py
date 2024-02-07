from django.db import models
from django.forms import ValidationError

from company.models import Company
from users.models import AdminUser
from utils.error_message import ERROR_INVALID_ASSIGNMENT
from .validators import validate_urls


# Create your models here.
class SendLiveDataList(models.Model):
    company = models.OneToOneField(
        Company,
        on_delete=models.CASCADE,
        related_name="send_company_livedata",
        null=True,
        blank=True,
    )
    user = models.OneToOneField(
        AdminUser,
        on_delete=models.CASCADE,
        related_name="send_adminuser_livedata",
        null=True,
        blank=True,
    )

    endpoint = models.CharField(
        max_length=255, blank=True, null=True, validators=[validate_urls]
    )

    def __str__(self):
        if self.company:
            return f"Send live data over {self.company}"
        else:
            return f"Send live data over {self.user}"

    def clean(self):
        if (self.company and self.user) or (not self.company and not self.user):
            raise ValidationError(ERROR_INVALID_ASSIGNMENT)
