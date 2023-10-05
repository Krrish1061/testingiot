from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .utilis import generate_token_key
from .models import WebSocketToken


# Create your views here.
# clean up the expired token in regular interval
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def get_websocket_token(request):
    token_key = generate_token_key()
    while WebSocketToken.objects.filter(token=token_key).exists():
        token_key = generate_token_key()
    token = WebSocketToken.objects.create(user=request.user, token=token_key)
    return Response(token, status=status.HTTP_200_OK)
