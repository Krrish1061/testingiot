from rest_framework import status
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

from caching.cache import Cache
from utils.error_message import ERROR_INVALID_API_KEY, ERROR_NO_API_KEY_PROVIDED

from .exceptions import InactiveDeviceException
from .models import IotDevice
from .utilis import generate_auth_cache_key


class DeviceAuthentication(BaseAuthentication):
    """Device Authentication via Api Key"""

    def authenticate(self, request):
        api_key = request.headers.get("API-KEY")
        if not api_key:
            api_key = request.data.get("API-KEY")
        if not api_key:
            raise AuthenticationFailed(
                {"error": ERROR_NO_API_KEY_PROVIDED},
                status.HTTP_401_UNAUTHORIZED,
            )

        cache_key = generate_auth_cache_key(api_key)
        iot_device = Cache.get(cache_key)

        if not iot_device:
            try:
                iot_device = IotDevice.objects.select_related("user", "company").get(
                    api_key=api_key
                )
                Cache.set(cache_key, iot_device)

            except IotDevice.DoesNotExist:
                raise AuthenticationFailed(
                    {"error": ERROR_INVALID_API_KEY}, status.HTTP_401_UNAUTHORIZED
                )

        if not iot_device.is_active:
            raise InactiveDeviceException()

        if iot_device.user:
            # if device is associated with admin user
            return (iot_device.user, iot_device)

        # Device is asscociated with the company
        return (None, (iot_device, iot_device.company))

    def authenticate_header(self, request):
        return "API-KEY"
