"""
General web socket Middlewares
"""

from urllib.parse import parse_qs

from channels.auth import AuthMiddlewareStack
from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.db import close_old_connections
from django.utils import timezone

from users.cache import UserCache
from websocket.cache import WebSocketCache
import logging

logger = logging.getLogger(__name__)


@database_sync_to_async
def get_token(token):
    """Gets the Token Object associated with the provided Token"""
    websocket_token = WebSocketCache.get_websocket_by_token_key(token)
    if websocket_token and websocket_token.expires_at >= timezone.now():
        user = UserCache.get_user(websocket_token.user.username)
        return (websocket_token.token, user)
    return (None, None)


class JwtAuthMiddleware(BaseMiddleware):
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        # Close old database connections to prevent usage of timed out connections
        close_old_connections()
        # Get the token from query params
        token_query_string = parse_qs(scope["query_string"].decode("utf8"))
        token = token_query_string.get("token", [None])[0]
        logger.warning(f"inside JwtAuthMiddleware websocket method initiated 1")
        if token:
            # get the token object from the database
            token_obj, user = await get_token(token)
            logger.warning(f"inside JwtAuthMiddleware websocket method initiated 2")
            if token_obj:
                # set the user
                scope["user"] = user
                company_slug = (
                    user.company.slug if user.is_associated_with_company else None
                )
                logger.warning(
                    f"inside JwtAuthMiddleware websocket method initiated by user {user.username}-{user.type}-{company_slug}"
                )
                return await super().__call__(scope, receive, send)

        # to disconnect the websocket connection a bit slow
        # probably need to throw channels.exceptions.StopConsumer exception check docs Closing Consumers
        logger.warning(
            f"outside JwtAuthMiddleware websocket method initiated by user {user.username}-{user.type}-{company_slug}"
        )
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
