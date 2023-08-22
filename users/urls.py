from django.urls import path
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# URLConfig
urlpatterns = [
    path("", views.user),
    path("<int:id>/", views.user),
    path("profile/<int:id>/", views.user_profile, name="user_profile"),
    path("login/", views.login_user, name="login_user"),
    path("logout/", views.logout_user),
    # path("<int:id>/", views.user_view),
    # path("websocket-token/", views.websocket_token, name="websocket_token"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
