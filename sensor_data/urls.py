from django.urls import path
from . import views

# URLConfig
urlpatterns = [
    path("post/sensor-data/", views.save_sensor_data),
    path("get/sensor-data/", views.sensor_data_view),
    path("get/get-sensordata/", views.get_sensordata),
]
