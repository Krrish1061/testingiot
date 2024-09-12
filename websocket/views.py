from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from websocket.cache import WebSocketCache
from .models import WebSocketToken
from .utilis import generate_token_key
import logging

logger = logging.getLogger(__name__)


# Create your views here.
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def get_websocket_token(request):
    user = request.user
    websocket_token = WebSocketCache.get_websocket_token(user.username)
    if websocket_token is None:
        token_key = generate_token_key()
        while WebSocketToken.objects.filter(token=token_key).exists():
            token_key = generate_token_key()
        websocket_token = WebSocketToken.objects.create(
            user=request.user, token=token_key
        )
        WebSocketCache.set_websocket_token(user.username, websocket_token)
    logger.warning(
        f"inside get_websocket_token view websocket {user.username} {user.type}"
    )
    return Response({"token": websocket_token.token}, status=status.HTTP_200_OK)
