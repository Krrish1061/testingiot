from django.urls import path
from . import views


# URLConfig
urlpatterns = [
    # "domain/api/savedata" for saving the data in the devices.
    path("post/", views.save_sensor_data),
    path("get/", views.get_sensor_data),
]
