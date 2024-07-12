import zoneinfo
from datetime import datetime

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed

from utils.error_message import ERROR_INVALID_TOKEN


class CustomJWTAuthentication(JWTAuthentication):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def authenticate(self, request):
        result = super().authenticate(request)

        if result is None:
            return None

        user, token = result
        created_at_epoch_time = token.get("iat")
        kathmandu_tz = zoneinfo.ZoneInfo("Asia/Kathmandu")
        created_at = datetime.fromtimestamp(created_at_epoch_time, tz=kathmandu_tz)
        invalidate_jwt_token_upto = user.invalidate_jwt_token_upto
        if invalidate_jwt_token_upto and invalidate_jwt_token_upto >= created_at:
            raise AuthenticationFailed(ERROR_INVALID_TOKEN)
        return (user, token)
