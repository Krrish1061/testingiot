from rest_framework import serializers
from .models import Company, CompanyProfile


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = [
            "id",
            "name",
            "slug",
            "address",
            "email",
            "user_limit",
        ]
        read_only_fields = ("slug",)


class CompanyProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyProfile
        fields = [
            "company",
            "logo",
            "contact_phone",
        ]
        read_only_fields = ("company",)
