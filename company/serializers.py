from rest_framework import serializers
from .models import Company


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = [
            "name",
            "address",
            "contact_email",
            "contact_phone",
            "user_limit",
            "create_partition",
        ]
        read_only_fields = ("create_partition", "user_limit")
