from django.urls import path
from . import views


# URLConfig
urlpatterns = [
    path("", views.iot_device),
    path("<int:id>/", views.iot_device),
]
