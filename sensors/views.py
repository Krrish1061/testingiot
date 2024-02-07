from django.contrib.auth import get_user_model
from django.db.models import ProtectedError
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from caching.cache import Cache
from caching.cache_key import (
    SENSOR_LIST_CACHE_KEY,
    SENSOR_LIST_CACHE_KEY_APP_NAME,
)
from sensors.cache import SensorCache
from users.cache import UserCache
from utils.commom_functions import get_groups_tuple
from utils.constants import GroupName
from utils.error_message import (
    ERROR_PERMISSION_DENIED,
    ERROR_SENSOR_NOT_FOUND,
    error_protected_delete_message,
)

from .models import Sensor
from .serializers import SensorSerializer

User = get_user_model()


# def get_sensor_list():
#     """Get the list of the sensors objects"""
#     sensors = Cache.get_all(
#         cache_key=SENSOR_LIST_CACHE_KEY, app_name=SENSOR_LIST_CACHE_KEY_APP_NAME
#     )
#     if sensors is None:
#         sensors = Sensor.objects.all()
#         Cache.set_all(
#             cache_key=SENSOR_LIST_CACHE_KEY,
#             app_name=SENSOR_LIST_CACHE_KEY_APP_NAME,
#             data=sensors,
#         )
#     return sensors if sensors else None


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_sensor_all(request):
    user = UserCache.get_user(username=request.user.username)
    user_groups = get_groups_tuple(user)
    sensors = SensorCache.get_all_sensor()
    if GroupName.SUPERADMIN_GROUP not in user_groups:
        sensors_list = []
        if user.is_associated_with_company:
            sensors_list = SensorCache.get_all_company_sensor(user.company)
        elif GroupName.ADMIN_GROUP in user_groups:
            sensors_list = SensorCache.get_all_user_sensor(user)
        else:
            sensors_list = SensorCache.get_all_user_sensor(user.created_by)
        sensors = [sensor for sensor in sensors if sensor.name in sensors_list]

    serializer = SensorSerializer(sensors, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_sensor(request):
    user = UserCache.get_user(username=request.user.username)
    user_groups = get_groups_tuple(user)
    if GroupName.SUPERADMIN_GROUP in user_groups:
        serializer = SensorSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        sensor = serializer.save()
        SensorCache.set_sensor(sensor)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response(
            {"error": ERROR_PERMISSION_DENIED}, status=status.HTTP_403_FORBIDDEN
        )


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def sensor(request, name):
    user = UserCache.get_user(username=request.user.username)
    user_groups = get_groups_tuple(user)
    if GroupName.SUPERADMIN_GROUP in user_groups:
        sensor = SensorCache.get_sensor(name)
        if sensor is None:
            return Response(
                {"error": ERROR_SENSOR_NOT_FOUND},
                status=status.HTTP_404_NOT_FOUND,
            )

        if request.method == "GET":
            serializer = SensorSerializer(sensor)
            return Response(serializer.data, status=status.HTTP_200_OK)

        if request.method == "PATCH":
            serializer = SensorSerializer(sensor, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            SensorCache.delete_sensor(sensor.id)
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == "DELETE":
            try:
                sensor.delete()
                SensorCache.delete_sensor(sensor.id)
            except ProtectedError as e:
                related_objects = e.protected_objects
                # send list of projected objects
                error_message = error_protected_delete_message(
                    sensor, len(related_objects)
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
