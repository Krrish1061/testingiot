import zoneinfo
from datetime import datetime

from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.models import update_last_login
from django.core.signing import BadSignature
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from users.cache import UserCache
from users.serializers import CustomTokenObtainPairSerializer, UserSerializer
from utils.error_message import (
    ERROR_INCORRECT_USERNAME_PASSWORD,
    ERROR_INVALID_TOKEN,
    ERROR_REFRESH_TOKEN_NOT_FOUND,
)


def get_tokens_for_user(user):
    refresh = CustomTokenObtainPairSerializer.get_token(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


@ensure_csrf_cookie
@csrf_protect
@api_view(["POST"])
def login_user(request):
    username_or_email = request.data.get("username")
    password = request.data.get("password")
    user = authenticate(request, username=username_or_email, password=password)

    if user:
        # Updating last_login manually
        update_last_login(None, user)

        serializer = UserSerializer(user, context={"request": request})
        token = get_tokens_for_user(user)
        response = Response(status=status.HTTP_200_OK)

        response.data = {
            "user": serializer.data,
            "access": token.get("access"),
        }

        response.set_signed_cookie(
            key=settings.SIMPLE_JWT["AUTH_COOKIE"],
            value=token.get("refresh"),
            domain=settings.SIMPLE_JWT["AUTH_COOKIE_DOMAIN"],
            expires=(datetime.now() + settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"]),
            secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
            httponly=settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
            samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
        )

        return response

    else:
        return Response(
            {"error": ERROR_INCORRECT_USERNAME_PASSWORD},
            status=status.HTTP_401_UNAUTHORIZED,
        )


@csrf_protect
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_user(request):
    try:
        refresh_token = request.get_signed_cookie("refresh_token")
        token = RefreshToken(refresh_token)
        token.blacklist()
    except:
        pass
    response = Response("logout sucessfully", status=status.HTTP_200_OK)
    response.delete_cookie(
        settings.SIMPLE_JWT["AUTH_COOKIE"],
        domain=settings.SIMPLE_JWT["AUTH_COOKIE_DOMAIN"],
        path=settings.SIMPLE_JWT["AUTH_COOKIE_PATH"],
    )
    return response


# implement Rate Limiting
@api_view(["POST"])
@csrf_protect
def cookie_token_refresh(request):
    """
    Handles access token refresh using a refresh token stored in a signed cookie.

    """
    try:
        refresh_token = request.get_signed_cookie("refresh_token")
    except KeyError:
        return Response(
            {"error": ERROR_REFRESH_TOKEN_NOT_FOUND},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    except BadSignature:
        return Response(
            {"error": ERROR_INVALID_TOKEN},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    try:
        token = RefreshToken(refresh_token)
    except TokenError:
        return Response(
            {"error": ERROR_INVALID_TOKEN},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    created_at_epoch_time = token.get("iat")
    username = token.get("username")

    if not created_at_epoch_time or not username:
        return Response(
            {"error": "Invalid token payload."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    user = UserCache.get_user(username)

    if user is None:
        return Response(
            {"error": ERROR_INVALID_TOKEN},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    kathmandu_tz = zoneinfo.ZoneInfo("Asia/Kathmandu")
    created_at = datetime.fromtimestamp(created_at_epoch_time, tz=kathmandu_tz)
    invalidate_jwt_token_upto = user.invalidate_jwt_token_upto

    if invalidate_jwt_token_upto and invalidate_jwt_token_upto >= created_at:
        token.blacklist()
        response = Response(
            {"error": ERROR_INVALID_TOKEN}, status=status.HTTP_401_UNAUTHORIZED
        )
        response.delete_cookie(
            settings.SIMPLE_JWT["AUTH_COOKIE"],
            domain=settings.SIMPLE_JWT["AUTH_COOKIE_DOMAIN"],
            path=settings.SIMPLE_JWT["AUTH_COOKIE_PATH"],
        )
        return response

    serializer = TokenRefreshSerializer(data={"refresh": refresh_token})
    try:
        serializer.is_valid(raise_exception=True)
    except TokenError as e:
        raise InvalidToken(e.args[0])
    return Response(serializer.validated_data, status=status.HTTP_200_OK)


@api_view(["GET"])
@ensure_csrf_cookie
def get_csrf_token(request):
    return Response({"csrfToken": get_token(request)})
