from django.urls import path

from . import views

# URLConfig
urlpatterns = [
    path("", views.add_company, name="add-company"),
    path("all/", views.company_list_all, name="company-list-all"),
    path("<slug:company_slug>/", views.company, name="company-detail"),
    path(
        "<slug:company_slug>/profile/",
        views.company_profile,
        name="company-profile",
    ),
]
