from django.urls import path
from . import views


# URLConfig
urlpatterns = [
    path("token/", views.get_websocket_token, name="websocket-token"),
    path("get-initial-data/", views.initial_data, name="initial-data"),
]
