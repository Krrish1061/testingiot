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

    def validate_min_max_limit(self, attrs, instance=None):
        max_limit = attrs.get("max_limit")
        min_limit = attrs.get("min_limit")
        if max_limit is not None and min_limit is not None:
            if max_limit < min_limit:
                return True
        elif max_limit is not None:
            if (
                instance
                and instance.min_limit is not None
                and max_limit < instance.min_limit
            ):
                return True
        elif min_limit is not None:
            if (
                instance
                and instance.max_limit is not None
                and min_limit > instance.max_limit
            ):
                return True
        return False

    def validate(self, attrs):
        request = self.context["request"]
        instance = self.instance if request.method == "PATCH" else None
        if self.validate_min_max_limit(attrs=attrs, instance=instance):
            raise serializers.ValidationError(
                {
                    "errors": "max limit must be greater than min limit and min limit must be smaller than max limit"
                }
            )
        return attrs
