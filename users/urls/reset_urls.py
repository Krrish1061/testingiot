from django.urls import path
from users.views import reset_views

reset_urlpatterns = [
    path("password-reset/", reset_views.password_reset, name="password-reset"),
    path(
        "password-reset-confirm/<str:username>/<str:token>",
        reset_views.password_reset_confirm,
        name="password-reset-confirm",
    ),
]
