from rest_framework import serializers
from django.core.exceptions import ObjectDoesNotExist
from company.views import User
from .models import SendLiveDataList


class SendLiveDataListSerializer(serializers.ModelSerializer):
    class Meta:
        model = SendLiveDataList
        fields = [
            "id",
            "company",
            "user",
            "endpoint",
        ]
        extra_kwargs = {
            "company": {
                "error_messages": {
                    "does_not_exist": "Company with the specified ID does not exist."
                },
            },
            "user": {
                "error_messages": {
                    "does_not_exist": "Admin User with the specified ID does not exist."
                },
            },
        }

    def validate(self, attrs):
        if ("user" in attrs) and ("company" in attrs):
            raise serializers.ValidationError(
                {
                    "error": "Instance should only be associate with either Admin User or Company"
                }
            )
        return attrs
