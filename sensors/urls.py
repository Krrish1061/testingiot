from django.urls import path
from . import views


# URLConfig
urlpatterns = [
    path("", views.sensor),
    path("<int:id>/", views.sensor),
    #  use slug for company and sensor
    path("company/<int:id>/", views.company_sensor),
    path("company/<int:id>/<str:sensor_name>/", views.company_sensor),
    path("admin-user/<int:id>/", views.admin_user_sensor),
    path("admin-user/<int:id>/<str:sensor_name>/", views.admin_user_sensor),
]
