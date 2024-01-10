from django.urls import path
from users.views import users_view, settings_views

# URLConfig
urlpatterns = [
    path("", users_view.user, name="user-detail"),
    path("add/user/", users_view.add_user, name="add-user"),
    path("users/all/", users_view.get_all_users, name="get-all-users"),
    path("profile/", users_view.user_profile, name="user_profile"),
    path("change-password/", settings_views.change_password, name="change-password"),
    path("change-username/", settings_views.change_username, name="change-username"),
    path("change-email/", settings_views.change_email, name="change-email"),
    path(
        "api-key/", settings_views.generate_user_api_key, name="generate-user-api-key"
    ),
]
