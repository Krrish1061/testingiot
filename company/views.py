from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ObjectDoesNotExist
from django.db import connection
from rest_framework import status
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from users.auth import ApiKeyAuthentication
from .models import Company
from .serializers import CompanySerializer

# Create your views here.
User = get_user_model()


@login_required
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_company(request):
    if User.objects.filter(pk=request.user.id, groups__name="super_admin").exists():
        serializer = CompanySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        company = serializer.save()
        if company.create_partition:
            with connection.cursor() as cursor:
                cursor.execute(
                    f"ALTER TABLE sensor_data_sensordata REORGANIZE PARTITION p_max INTO (PARTITION p_{company.pk}-{company.slug} VALUES IN ({company.pk}), PARTITION p_max VALUES IN (10000));"
                )
                cursor.execute(
                    f"ALTER TABLE sensor_data_sensordata REBUILD PARTITION p_{company.pk}-{company.slug};"
                )
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response(
            {"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN
        )


@login_required
@api_view(["POST", "GET", "PATCH"])
@permission_classes([IsAuthenticated])
@authentication_classes([ApiKeyAuthentication])
def company_detail(request, pk):
    requested_user = request.user
    try:
        company = Company.objects.get(pk=pk)
    except ObjectDoesNotExist:
        return Response(
            {"error": "Company does not exists"}, status=status.HTTP_404_NOT_FOUND
        )
    if request.method == "GET":
        #  make sure create_partition is not passed in api and updating this field is not allowed
        serializer = CompanySerializer(company)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == "PATCH":
        if User.objects.filter(
            pk=requested_user.id, groups__name="super_admin"
        ).exists():
            serializer = CompanySerializer(company, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            print(serializer.data)
            return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == "DELETE":
        if User.objects.filter(
            pk=requested_user.id, groups__name="super_admin"
        ).exists():
            company.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
    else:
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)


from sensor_data.models import IotDevice
from sensor_data.serializers import IotDeviceSerializer


# @login_required
@api_view(["GET", "PATCH", "DELETE"])
# @permission_classes([IsAuthenticated])
@authentication_classes([ApiKeyAuthentication])
def iot_device_view(request, id):
    try:
        iot_device = IotDevice.objects.select_related("company").get(pk=id)
    except ObjectDoesNotExist:
        return Response(
            {"error": f"Iot device does not exists"}, status=status.HTTP_404_NOT_FOUND
        )

    if request.method == "GET":
        if iot_device.company != request.user.company:
            return Response(
                {
                    "error": f"Requested Iot device is not associated with the {(request.user.company.name).upper()} company."
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = IotDeviceSerializer(iot_device)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == "PATCH":
        if User.objects.filter(pk=request.user.id, groups__name="super_admin").exists():
            serializer = IotDeviceSerializer(
                iot_device, data=request.data, partial=True
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == "DELETE":
        if User.objects.filter(pk=request.user.id, groups__name="super_admin").exists():
            iot_device.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
    else:
        return Response(
            {"error": "Method not allowed"},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )


# @login_required
@api_view(["GET", "PATCH", "DELETE"])
# @permission_classes([IsAuthenticated])
@authentication_classes([ApiKeyAuthentication])
def iot_device(request):
    company = request.user.company.id
    iot_device_list = (
        Company.objects.select_related("iot-device")
        .filter(pk=company)
        .values("iot_device")
    )
    print(iot_device_list)
    iot_device = IotDevice.objects.filter(pk__in=iot_device_list)
    serializer = IotDeviceSerializer(iot_device, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
