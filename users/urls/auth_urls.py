from django.urls import path
from users.views import auth_views, settings_views
from .reset_urls import reset_urlpatterns

# URLConfig
auth_urlpatterns = [
    path("login/", auth_views.login_user, name="login"),
    path("csrf/", auth_views.get_csrf_token, name="csrf"),
    path("token/refresh/", auth_views.cookie_token_refresh, name="token_refresh"),
    path(
        "validate-email/<str:username>/<str:token>",
        settings_views.verify_email,
        name="verify-email",
    ),
    path(
        "update-email/<str:username>/<str:token>",
        settings_views.verify_update_email,
        name="verify-update-email",
    ),
    path(
        "set-user-password/<str:username>/<str:token>",
        settings_views.set_user_password,
        name="set-user-password",
    ),
    path("<str:username>/logout/", auth_views.logout_user, name="logout"),
]


urlpatterns = auth_urlpatterns + reset_urlpatterns
