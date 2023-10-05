from rest_framework import serializers
from .models import Company, CompanyProfile


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = [
            "id",
            "name",
            "email",
            "phone_number",
            "slug",
            "address",
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
            "description",
        ]
        read_only_fields = ("company",)
