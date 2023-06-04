from django.urls import path
from . import views


# URLConfig
urlpatterns = [
    path("register/", views.create_company),
    path("<int:id>/", views.company_detail),
]
