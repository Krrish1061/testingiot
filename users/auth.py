from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model
from rest_framework import status

user_model = get_user_model()


class ApiKeyAuthentication(BaseAuthentication):
    """User Authentication via Api Key"""

    def authenticate(self, request):
        api_key = request.headers.get("api-key")

        if not api_key:
            raise AuthenticationFailed(
                "Include API key or unsupported format", status.HTTP_401_UNAUTHORIZED
            )
        try:
            user = user_model.objects.get(api_key=api_key)
        except user_model.DoesNotExist:
            raise AuthenticationFailed("Invalid API key", status.HTTP_401_UNAUTHORIZED)
        return (user, None)

    def authenticate_header(self, request):
        return "API-Key"
