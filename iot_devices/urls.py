from django.urls import path
from . import views


# URLConfig
urlpatterns = [
    path("", views.add_iot_device, name="add-iot-device"),
    path("all/", views.iot_device_list_all, name="iot-device-list-all"),
    path("<int:id>/", views.iot_device, name="iot-device-detail"),
]
