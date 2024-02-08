from django.urls import re_path
from . import consumer


websocket_urlpatterns = [
    # modify the url into something meaningful
    re_path(r"ws/iot/pubsub/", consumer.SensorDataConsumer.as_asgi()),
]
