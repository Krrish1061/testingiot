from django.apps import AppConfig


class IotDevicesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "iot_devices"

    def ready(self):
        import iot_devices.signals
