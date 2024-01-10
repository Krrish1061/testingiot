from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model
from rest_framework import status
from users.cache import UserCache
from users.utilis import generate_user_auth_cache_key
from utils.error_message import ERROR_NO_API_KEY_PROVIDED, ERROR_INVALID_API_KEY

User = get_user_model()


class ApiKeyAuthentication(BaseAuthentication):
    """User Authentication via Api Key"""

    def authenticate(self, request):
        api_key = request.headers.get("api-key")
        if not api_key:
            raise AuthenticationFailed(
                ERROR_NO_API_KEY_PROVIDED, status.HTTP_401_UNAUTHORIZED
            )

        cache_key = generate_user_auth_cache_key(api_key)
        user = UserCache.get(cache_key)

        if not user:
            try:
                user = User.objects.select_related("company").get(api_key=api_key)
                UserCache.set(cache_key, user)
            except User.DoesNotExist:
                raise AuthenticationFailed(
                    ERROR_INVALID_API_KEY, status.HTTP_401_UNAUTHORIZED
                )
        return (user, None)

    def authenticate_header(self, request):
        return "API-KEY"
