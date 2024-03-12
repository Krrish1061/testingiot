from django.urls import path
from . import views


# URLConfig
urlpatterns = [
    path("add/", views.add_sensor, name="add-sensor"),
    path("all/", views.get_sensor_all, name="get-sensor-all"),
    path("<str:name>/", views.sensor, name="sensor-detail"),
    path(
        "change-name/<str:name>/", views.change_sensor_name, name="change-sensor-name"
    ),
]
