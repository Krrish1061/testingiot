from django.urls import path
from . import views

# URLConfig
urlpatterns = [
    path("", views.add_user, name="add-user"),
    path("users/all/", views.user_list_all, name="user-list-all"),
    path("<int:id>/", views.user, name="user-detail"),
    path("profile/", views.user_profile, name="user_profile"),
    path("api-key/", views.generate_api_key, name="generate_api_key"),
    # path("token-csrf/", views.get_csrf_token),
    # path("token/refresh/", views.cookie_token_refresh, name="token_refresh"),
]
