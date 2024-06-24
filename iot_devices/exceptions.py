from rest_framework.exceptions import APIException
from utils.error_message import ERROR_DEVICE_INACTIVE, ERROR_UNASSOCIATED_DEVICE


class InactiveDeviceException(APIException):
    status_code = 403
    default_detail = ERROR_DEVICE_INACTIVE
    default_code = "inactive_device"


class UnAssociatedDeviceException(APIException):
    status_code = 400
    default_detail = ERROR_UNASSOCIATED_DEVICE
    default_code = "unassociated_device"
