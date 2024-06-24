from django.urls import path
from . import views

# URLConfig
urlpatterns = [
    path("", views.add_dealer, name="add-dealer"),
    path("all/", views.dealer_list_all, name="dealer-list-all"),
    path("<slug:dealer_slug>/", views.dealer, name="dealer-detail"),
    path(
        "<slug:dealer_slug>/profile/",
        views.dealer_profile,
        name="dealer-profile",
    ),
    path(
        "get/<str:username>/",
        views.get_dealer_by_user,
        name="get-dealer-by-user",
    ),
]
