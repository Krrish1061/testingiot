"""
URL configuration for iot project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include

# from django.views.generic import TemplateView


# "domain/api/savedata" for saving the data in the devices.
urlpatterns = [
    # path("", TemplateView.as_view(template_name="index.html")),
    path("admin/", admin.site.urls),
    path("sensor/", include("sensors.urls")),
    path("iot-device/", include("iot_devices.urls")),
    path("sensor-data/", include("sensor_data.urls")),
    path("company/", include("company.urls")),
    path("websocket/", include("websocket.urls")),
    path("api/", include("api.urls")),
    path("send-data/", include("send_livedata.urls")),
    path("account/", include("users.urls.auth_urls")),
    path("<str:username>/", include("users.urls.urls")),
]

if settings.DEBUG:
    urlpatterns += [path("__debug__/", include("debug_toolbar.urls"))] + static(
        settings.MEDIA_URL, document_root=settings.MEDIA_ROOT
    )


# urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
