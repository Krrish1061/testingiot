"""
General web socket middlewares
"""
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.tokens import AccessToken
from channels.middleware import BaseMiddleware
from channels.auth import AuthMiddlewareStack
from django.db import close_old_connections
from urllib.parse import parse_qs
from rest_framework.response import Response
from rest_framework import status

User = get_user_model()


@database_sync_to_async
def get_user(user_id):
    try:
        user = User.objects.select_related("company").get(id=user_id)
        return user
    except get_user_model().DoesNotExist:
        return AnonymousUser()


class JwtAuthMiddleware(BaseMiddleware):
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        # Close old database connections to prevent usage of timed out connections
        close_old_connections()

        # Get the token
        token_query_string = parse_qs(scope["query_string"].decode("utf8"))
        token = token_query_string.get("token", [None])[0]

        if token:
            try:
                # This will automatically validate the token and raise an error if token is invalid
                # UntypedToken(token)
                token_obj = AccessToken(token)
            except (InvalidToken, TokenError) as e:
                # Token is invalid and log error
                # print(e)
                return None
            else:
                decoded_data = token_obj.payload
                user_id = decoded_data.get("user_id")

                # Get the user using ID
                scope["user"] = await get_user(user_id=user_id)
            return await super().__call__(scope, receive, send)
        else:
            return Response("No Token provided", status=status.HTTP_401_UNAUTHORIZED)


def JwtAuthMiddlewareStack(inner):
    return JwtAuthMiddleware(AuthMiddlewareStack(inner))
