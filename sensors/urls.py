from django.urls import path
from . import views


# URLConfig
urlpatterns = [
    path("add/", views.add_sensor, name="add-sensor"),
    path("all/", views.get_sensor_all, name="get-sensor-all"),
    path("<str:name>/", views.sensor, name="sensor-detail"),
    path(
        "company/<slug:company_slug>/",
        views.company_sensor_add_or_get,
        name="company-sensor-add-or-get",
    ),
    path(
        "company/<slug:company_slug>/<str:sensor_name>/",
        views.company_sensor_update_or_delete,
        name="company-sensor-update-or-delete",
    ),
    path(
        "user/<str:username>/",
        views.admin_user_sensor_add_or_get,
        name="admin-user-sensor-add-or-get",
    ),
    path(
        "user/<str:username>/<str:sensor_name>/",
        views.admin_user_sensor_update_or_delete,
        name="admin-user-sensor-update-or-delete",
    ),
]
