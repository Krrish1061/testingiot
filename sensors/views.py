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
from .models import Sensor, AdminUserSensor, CompanySensor
from .serializers import (
    SensorSerializer,
    CompanySensorSerializer,
    AdminUserSensorSerializer,
)
from django.contrib.auth import get_user_model
from users.auth import ApiKeyAuthentication

User = get_user_model()


@api_view(["POST", "GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
# @authentication_classes([ApiKeyAuthentication])
def sensor(request, id=None):
    if User.objects.filter(pk=request.user.id, groups__name="super_admin").exists():
        if request.method == "POST":
            serializer = SensorSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == "GET":
            sensor = Sensor.objects.all()
            serializer = SensorSerializer(sensor, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        else:
            try:
                sensor = Sensor.objects.get(pk=id)
            except ObjectDoesNotExist:
                return Response(
                    {"error": "Sensor does not exists"},
                    status=status.HTTP_404_NOT_FOUND,
                )
            if request.method == "PATCH":
                serializer = SensorSerializer(sensor, data=request.data, partial=True)
                serializer.is_valid(raise_exception=True)
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)

            elif request.method == "DELETE":
                try:
                    sensor.delete()
                except ProtectedError as e:
                    related_objects = e.protected_objects
                    # send list of projected objects
                    error_message = f'Cannot delete "{sensor}". It is referenced by {len(related_objects)} other objects.'
                    return Response(
                        {"error": error_message},
                        status=status.HTTP_404_NOT_FOUND,
                    )

                return Response(status=status.HTTP_204_NO_CONTENT)

    else:
        return Response(
            {"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN
        )


@api_view(["POST", "GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
# @authentication_classes([ApiKeyAuthentication])
def company_sensor(request, id, sensor_name=None):
    if User.objects.filter(pk=request.user.id, groups__name="super_admin").exists():
        if request.method == "POST":
            sensor_name = Sensor.objects.all().values_list("name", flat=True)
            serializer = CompanySensorSerializer(
                data=request.data,
                context={
                    "sensor_name": sensor_name,
                    "company_id": id,
                    "request": request,
                },
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response("ok", status=status.HTTP_200_OK)
        elif request.method == "GET":
            company_sensor = CompanySensor.objects.filter(company=id)
            serializer = CompanySensorSerializer(company_sensor, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        elif request.method == "PATCH":
            company_sensor = CompanySensor.objects.filter(
                company=id, sensor__name=sensor_name
            ).first()
            if not company_sensor:
                return Response(
                    {"error": "Provided Sensor is not associated with the Company"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            sensor_name_list = Sensor.objects.all().values_list("name", flat=True)

            serializer = CompanySensorSerializer(
                company_sensor,
                data=request.data,
                context={
                    "sensor_name": sensor_name_list,
                    "company_id": id,
                    "request": request,
                },
                partial=True,
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == "DELETE":
            if not sensor_name:
                return Response(
                    {"error": "No Sensor name provided for the Company"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            company_sensor = CompanySensor.objects.filter(
                company=id, sensor__name=sensor_name
            ).first()
            if not company_sensor:
                return Response(
                    {"error": "Provided Sensor is not associated with the Company"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                company_sensor.delete()
            except ProtectedError as e:
                related_objects = e.protected_objects
                # send list of projected objects
                error_message = f'Cannot delete "{company_sensor}". It is referenced by {len(related_objects)} other objects.'
                return Response(
                    {"error": error_message},
                    status=status.HTTP_404_NOT_FOUND,
                )

            return Response(status=status.HTTP_204_NO_CONTENT)
    else:
        return Response(
            {"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN
        )


@api_view(["POST", "GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
# @authentication_classes([ApiKeyAuthentication])
def admin_user_sensor(request, id, sensor_name=None):
    if User.objects.filter(pk=request.user.id, groups__name="super_admin").exists():
        if request.method == "POST":
            sensor_name_list = Sensor.objects.all().values_list("name", flat=True)
            serializer = AdminUserSensorSerializer(
                data=request.data,
                context={
                    "sensor_name": sensor_name_list,
                    "admin_user_id": id,
                    "request": request,
                },
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response("ok", status=status.HTTP_200_OK)

        elif request.method == "GET":
            admin_user_sensor = AdminUserSensor.objects.filter(user=id)
            serializer = AdminUserSensorSerializer(admin_user_sensor, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == "PATCH":
            admin_user_sensor = AdminUserSensor.objects.filter(
                user=id, sensor__name=sensor_name
            ).first()
            if not admin_user_sensor:
                return Response(
                    {"error": "Provided Sensor is not associated with the admin user"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            sensor_name_list = Sensor.objects.all().values_list("name", flat=True)

            serializer = AdminUserSensorSerializer(
                admin_user_sensor,
                data=request.data,
                context={
                    "sensor_name": sensor_name_list,
                    "admin_user_id": id,
                    "request": request,
                },
                partial=True,
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == "DELETE":
            if not sensor_name:
                return Response(
                    {"error": "No Sensor name provided for the admin user"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

            admin_user_sensor = AdminUserSensor.objects.filter(
                user=id, sensor__name=sensor_name
            ).first()
            if not admin_user_sensor:
                return Response(
                    {"error": "Provided Sensor is not associated with the admin user"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

            try:
                admin_user_sensor.delete()
            except ProtectedError as e:
                related_objects = e.protected_objects
                # send list of projected objects
                error_message = f'Cannot delete "{admin_user_sensor}". It is referenced by {len(related_objects)} other objects.'
                return Response(
                    {"error": error_message},
                    status=status.HTTP_404_NOT_FOUND,
                )
            return Response(status=status.HTTP_204_NO_CONTENT)

    else:
        return Response(
            {"error": "Permission denied!"}, status=status.HTTP_403_FORBIDDEN
        )
