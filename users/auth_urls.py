from django.urls import path
from . import views

# URLConfig
urlpatterns = [
    path("login/", views.login_user, name="login"),
    path("csrf/", views.get_csrf_token, name="csrf"),
    path("token/refresh/", views.cookie_token_refresh, name="token_refresh"),
    path("autheticated/", views.autheticate_me, name="autheticate-me"),
    path("<str:username>/logout/", views.logout_user, name="logout"),
]
