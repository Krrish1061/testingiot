from rest_framework import status
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

from users.cache import UserCache
from users.exceptions import InActiveUserException
from utils.error_message import ERROR_INVALID_API_KEY, ERROR_NO_API_KEY_PROVIDED


class ApiKeyAuthentication(BaseAuthentication):
    """User Authentication via Api Key"""

    def authenticate(self, request):
        api_key = request.headers.get("api-key")
        if not api_key:
            raise AuthenticationFailed(
                ERROR_NO_API_KEY_PROVIDED, status.HTTP_401_UNAUTHORIZED
            )

        user = UserCache.get_user_by_api_key(api_key)

        if user is None:
            raise AuthenticationFailed(
                ERROR_INVALID_API_KEY, status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_active:
            raise InActiveUserException()

        return (user, None)

    def authenticate_header(self, request):
        return "API-KEY"
