from rest_framework import serializers
from .models import Sensor


class SensorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sensor
        fields = [
            "id",
            "name",
            "unit",
            "symbol",
            "created_at",
            "max_limit",
            "min_limit",
            "is_value_boolean",
        ]

        read_only_fields = ("id", "created_at")
