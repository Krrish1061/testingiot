from django.urls import path
from . import views


# URLConfig
urlpatterns = [
    path("", views.company, name="company-detail"),
    path("<slug:company_slug>/<int:id>/", views.company),
    path("<slug:company_slug>/<int:id>/profile/", views.company_profile),
]
