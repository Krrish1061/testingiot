from django.urls import path
from . import views


# URLConfig
urlpatterns = [
    path("token/", views.get_websocket_token, name="websocket-token"),
    path("testing/", views.get_initial_data, name="get-initial-data"),
]
