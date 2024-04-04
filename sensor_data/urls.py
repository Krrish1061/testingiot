from django.urls import path
from sensor_data.views import download_views, get_data_views, save_data_views


# URLConfig
urlpatterns = [
    # "domain/api/savedata" for saving the data in the devices.
    path("post/", save_data_views.save_sensor_data, name="save-sensor-data"),
    path("get/", get_data_views.get_sensor_data, name="get-sensor-data"),
    path("download/", download_views.download_sensor_data, name="download-sensor-data"),
]
