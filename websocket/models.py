from django.contrib.auth import get_user_model
from django.db import models
from django.utils import timezone

User = get_user_model()


# Create your models here.
class WebSocketToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=15, unique=True)
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    expires_at = models.DateTimeField()

    def __str__(self):
        return f"{self.user}-{self.token}"

    def save(self, *args, **kwargs):
        if not self.expires_at:
            # set the expire time for token
            self.expires_at = timezone.now() + timezone.timedelta(minutes=5)
        super().save(*args, **kwargs)
