from django.urls import path
from . import views


# URLConfig
urlpatterns = [
    # path("", views.send_livedata, name="send-data-over-list"),
    path("<int:id>/", views.send_livedata, name="send-data-over-list"),
]
