from rest_framework import status
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

from iot_devices.cache import IotDeviceCache
from utils.error_message import ERROR_INVALID_API_KEY, ERROR_NO_API_KEY_PROVIDED

from .exceptions import InactiveDeviceException


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

        iot_device = IotDeviceCache.get_iot_device_by_api_key(api_key)
        if iot_device is None:
            raise AuthenticationFailed(
                {"error": ERROR_INVALID_API_KEY}, status.HTTP_401_UNAUTHORIZED
            )

        if not iot_device.is_active:
            raise InactiveDeviceException()

        return (None, iot_device)

    def authenticate_header(self, request):
        return "API-KEY"
