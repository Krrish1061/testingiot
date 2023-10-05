from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import ProtectedError
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from caching.cache import Cache
from utils.constants import GroupName
from utils.error_message import (
    error_protected_delete_message,
    ERROR_DEVICE_NOT_FOUND,
    ERROR_PERMISSION_DENIED,
)

from caching.cache_key import (
    IOT_DEVICE_LIST_CACHE_KEY,
    IOT_DEVICE_LIST_CACHE_KEY_APP_NAME,
)

from .models import IotDevice
from .serializers import IotDeviceSerializer

User = get_user_model()


# Create your views here.
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_iot_device(request):
    if User.objects.filter(
        pk=request.user.id, groups__name=GroupName.SUPERADMIN_GROUP
    ).exists():
        serializer = IotDeviceSerializer(
            data=request.data,
            context={
                "request": request,
            },
        )
        serializer.is_valid(raise_exception=True)
        iot_device = serializer.save()
        Cache.set_to_list(
            cache_key=IOT_DEVICE_LIST_CACHE_KEY,
            app_name=IOT_DEVICE_LIST_CACHE_KEY_APP_NAME,
            data=iot_device,
        )
        return Response(serializer.data, status=status.HTTP_201_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def iot_device_list_all(request):
    if User.objects.filter(
        pk=request.user.id, groups__name=GroupName.SUPERADMIN_GROUP
    ).exists():
        iot_devices = Cache.get_all(
            cache_key=IOT_DEVICE_LIST_CACHE_KEY,
            app_name=IOT_DEVICE_LIST_CACHE_KEY_APP_NAME,
        )

        if iot_devices is None:
            #  improve later
            iot_devices = IotDevice.objects.select_related("company", "user").defer(
                "api_key",
                "company__user_limit",
                "user__password",
                "user__is_staff",
                "user__is_active",
                "user__api_key",
                "user__is_superuser",
                "user__last_login",
            )
            Cache.set_all(
                cache_key=IOT_DEVICE_LIST_CACHE_KEY,
                app_name=IOT_DEVICE_LIST_CACHE_KEY_APP_NAME,
                data=iot_devices,
            )

        serializer = IotDeviceSerializer(
            iot_devices,
            many=True,
            context={
                "request": request,
            },
        )

        return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def iot_device(request, id):
    if User.objects.filter(
        pk=request.user.id, groups__name=GroupName.SUPERADMIN_GROUP
    ).exists():
        iot_device = Cache.get_from_list(cache_key=IOT_DEVICE_LIST_CACHE_KEY, id=id)
        if not iot_device:
            try:
                iot_device = IotDevice.objects.select_related("user", "company").get(
                    pk=id
                )
                Cache.set_to_list(
                    cache_key=IOT_DEVICE_LIST_CACHE_KEY,
                    app_name=IOT_DEVICE_LIST_CACHE_KEY_APP_NAME,
                    data=iot_device,
                )
            except ObjectDoesNotExist:
                return Response(
                    {"error": ERROR_DEVICE_NOT_FOUND},
                    status=status.HTTP_404_NOT_FOUND,
                )

        if request.method == "GET":
            serializer = IotDeviceSerializer(
                iot_device,
                context={
                    "request": request,
                },
            )
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == "PATCH":
            serializer = IotDeviceSerializer(
                iot_device,
                data=request.data,
                context={
                    "request": request,
                },
                partial=True,
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            Cache.delete_from_list(IOT_DEVICE_LIST_CACHE_KEY, iot_device.id)
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == "DELETE":
            try:
                iot_device.delete()
                Cache.delete_from_list(IOT_DEVICE_LIST_CACHE_KEY, iot_device.id)
            except ProtectedError as e:
                related_objects = e.protected_objects
                # send list of protected objects
                error_message = error_protected_delete_message(
                    iot_device, len(related_objects)
                )
                return Response(
                    {"error": error_message},
                    status=status.HTTP_404_NOT_FOUND,
                )

            return Response(status=status.HTTP_204_NO_CONTENT)

    else:
        return Response(
            {"error": ERROR_PERMISSION_DENIED}, status=status.HTTP_403_FORBIDDEN
        )
