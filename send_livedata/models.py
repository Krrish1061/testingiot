from django.db import models
from django.forms import ValidationError

from company.models import Company
from users.models import AdminUser


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
    endpoint = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"Send live data over Company or Admin user"

    def clean(self):
        if (self.company and self.user) or (not self.company and not self.user):
            raise ValidationError(
                "Instance should only be associate with either Admin user or Company"
            )
