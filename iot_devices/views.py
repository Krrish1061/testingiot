from django.core.exceptions import ObjectDoesNotExist
from rest_framework import status
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from django.db.models import ProtectedError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.cache import cache
from users.auth import ApiKeyAuthentication
from .models import IotDevice
from .serializers import IotDeviceSerializer
from django.contrib.auth import get_user_model
from users.auth import ApiKeyAuthentication

User = get_user_model()


# Create your views here.
@api_view(["POST", "GET", "PATCH", "DELETE"])
# @authentication_classes([ApiKeyAuthentication])
@permission_classes([IsAuthenticated])
def iot_device(request, id=None):
    if User.objects.filter(pk=request.user.id, groups__name="super_admin").exists():
        if request.method == "POST":
            serializer = IotDeviceSerializer(
                data=request.data,
                context={
                    "request": request,
                },
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == "GET":
            iot_device = IotDevice.objects.all()
            serializer = IotDeviceSerializer(iot_device, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == "PATCH":
            print(request.data)
            print("inside delete id", id)
            try:
                iot_device = IotDevice.objects.get(pk=id)
            except ObjectDoesNotExist:
                return Response(
                    {"error": "Iot Devices does not exists"},
                    status=status.HTTP_404_NOT_FOUND,
                )
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
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == "DELETE":
            print(request.data)
            print("inside delete id", id)
            try:
                iot_device = IotDevice.objects.get(pk=id)
            except ObjectDoesNotExist:
                return Response(
                    {"error": "Iot Devices does not exists"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            try:
                iot_device.delete()
            except ProtectedError as e:
                related_objects = e.protected_objects
                # send list of projected objects
                error_message = f'Cannot delete "{iot_device}". It is referenced by {len(related_objects)} other objects.'
                return Response(
                    {"error": error_message},
                    status=status.HTTP_404_NOT_FOUND,
                )

            return Response(status=status.HTTP_204_NO_CONTENT)

    else:
        return Response(
            {"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN
        )
