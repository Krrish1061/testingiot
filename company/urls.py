from django.urls import path
from . import views


# URLConfig
urlpatterns = [
    path("register/", views.create_company),
    path("<int:id>/", views.company_detail),
    path("iot-device/<int:id>/", views.iot_device_view),
    path("iot-device/", views.iot_device),
]
