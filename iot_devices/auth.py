from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework import status
from .models import IotDevice


class DeviceAuthentication(BaseAuthentication):
    """Device Authentication via Api Key"""

    def authenticate(self, request):
        api_key = request.headers.get("api-key")
        if not api_key:
            raise AuthenticationFailed(
                {"error": "Include API key or unsupported format"},
                status.HTTP_401_UNAUTHORIZED,
            )
        try:
            iot_device = IotDevice.objects.get(api_key=api_key)
        except IotDevice.DoesNotExist:
            raise AuthenticationFailed(
                {"error": "Invalid API key"}, status.HTTP_401_UNAUTHORIZED
            )

        #  handle error in company and user doesnot exist
        if iot_device.user:
            return (iot_device.user, iot_device)

        return (None, (iot_device, iot_device.company))

    def authenticate_header(self):
        return "API-Key"
