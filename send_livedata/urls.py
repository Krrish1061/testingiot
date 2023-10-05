from django.urls import path
from . import views


# URLConfig
urlpatterns = [
    path("", views.add_send_livedata, name="add-send-data"),
    path("all/", views.send_livedata_list_all, name="list-send-data"),
    path("<int:id>/", views.send_livedata, name="send-data-over-list"),
]
