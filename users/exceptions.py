from rest_framework.exceptions import APIException
from utils.error_message import ERROR_INACTIVE_USER


class InActiveUserException(APIException):
    status_code = 403
    default_detail = ERROR_INACTIVE_USER
    default_code = "inactive_user"
