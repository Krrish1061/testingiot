"""
General web socket Middlewares
"""

from urllib.parse import parse_qs
from channels.auth import AuthMiddlewareStack
from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth import get_user_model
from django.db import close_old_connections
from django.utils import timezone


from .models import WebSocketToken

User = get_user_model()


@database_sync_to_async
def get_token(token):
    """Gets the Token Object associated with the provided Token"""
    try:
        token = WebSocketToken.objects.select_related("user").get(token=token)
        # checking expiration of the token
        if token.expires_at < timezone.now():
            return None
        return token
    except WebSocketToken.DoesNotExist:
        return None


class JwtAuthMiddleware(BaseMiddleware):
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        # Close old database connections to prevent usage of timed out connections
        close_old_connections()
        # Get the token from query params
        token_query_string = parse_qs(scope["query_string"].decode("utf8"))
        token = token_query_string.get("token", [None])[0]

        if token:
            # get the token object from the database
            token_obj = await get_token(token)
            if token_obj:
                # set the user
                scope["user"] = token_obj.user
                return await super().__call__(scope, receive, send)

        # to disconnect the websocket connection a bit slow
        return None

    # another approach is to accept connection as annoomous user
    # and close it immediately in consumer connect method with message and errorcode

    # this closes immediately but may be there is better approach
    #  await send(
    #         {
    #             "type": "websocket.close",
    #             "code": 4000,  # You can use a custom close code
    #             "reason": "Authentication failed",
    #         }
    #     )


def JwtAuthMiddlewareStack(inner):
    return JwtAuthMiddleware(AuthMiddlewareStack(inner))
