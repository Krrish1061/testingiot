from django.urls import path
from . import views


# URLConfig
urlpatterns = [
    path("post/", views.save_sensor_data),
    path("get/", views.sensor_data_view),
    path("iot-device/", views.sensorData_by_iotdevice),
]
