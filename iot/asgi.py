"""
ASGI config for iot project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "iot.settings")
django_asgi_app = get_asgi_application()


from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator, OriginValidator
from decouple import config
import websocket.routing
from websocket.authmiddleware import JwtAuthMiddlewareStack


application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": OriginValidator(
            JwtAuthMiddlewareStack(URLRouter(websocket.routing.websocket_urlpatterns)),
            [config("FRONTEND_BASE_URL")],
        ),
    }
)
