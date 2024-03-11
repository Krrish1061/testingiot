from django.urls import path
from . import views


# URLConfig
urlpatterns = [
    path("all/", views.iot_device_list_all, name="iot-device-list-all"),
    path("add/", views.add_iot_device, name="add-iot-device"),
    path(
        "device-sensors/all/",
        views.get_all_device_sensor,
        name="device-sensor-list-all",
    ),
    path("<int:id>/", views.iot_device, name="iot-device-detail"),
    path(
        "<int:device_id>/sensors/",
        views.device_sensor,
        name="device-sensor",
    ),
    path(
        "<int:device_id>/detail/",
        views.iot_device_detail,
        name="iot-device-detail",
    ),
    path(
        "<int:device_id>/get/api-key/",
        views.get_iot_device_api_key,
        name="get-iot-device-api-key",
    ),
]
