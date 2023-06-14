from django.urls import path
from . import views

# URLConfig
urlpatterns = [
    path("post/sensor-data/", views.save_sensor_data),
    path("get/sensor-data/", views.sensor_data_view),
    path("iot-device/create/", views.create_iot_device),
    path("iot-device/<int:id>/", views.iot_device),
    path("create/", views.create_sensor),
    path("<str:name>/", views.sensor),
    path("company-sensor/create/", views.create_company_sensor),
]
