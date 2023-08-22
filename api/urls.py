from django.urls import path
from . import views

# URLConfig
urlpatterns = [
    path("get/sensor-data/", views.get_sensor_data),
]
