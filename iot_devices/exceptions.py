from rest_framework.exceptions import APIException
from utils.error_message import ERROR_DEVICE_INACTIVE


class InactiveDeviceException(APIException):
    status_code = 403
    default_detail = ERROR_DEVICE_INACTIVE
    default_code = "inactive_device"
