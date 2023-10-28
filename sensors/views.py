from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import ProtectedError
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from caching.cache import Cache
from caching.cache_key import (
    ADMIN_USER_SENSOR_APP_NAME,
    COMPANY_SENSOR_APP_NAME,
    SENSOR_LIST_CACHE_KEY,
    SENSOR_LIST_CACHE_KEY_APP_NAME,
    get_admin_user_sensor_cache_key,
    get_company_sensor_cache_key,
)
from utils.constants import GroupName
from utils.error_message import (
    ERROR_PERMISSION_DENIED,
    ERROR_SENSOR_NOT_ASSOCIATED_WITH_ADMIN_USER,
    ERROR_SENSOR_NOT_ASSOCIATED_WITH_COMPANY,
    ERROR_SENSOR_NOT_FOUND,
    error_protected_delete_message,
)

from .models import AdminUserSensor, CompanySensor, Sensor
from .serializers import (
    AdminUserSensorSerializer,
    CompanySensorSerializer,
    SensorSerializer,
)

User = get_user_model()


def get_sensor_list():
    """Get the list of the sensors objects"""
    sensors = Cache.get_all(
        cache_key=SENSOR_LIST_CACHE_KEY, app_name=SENSOR_LIST_CACHE_KEY_APP_NAME
    )
    if sensors is None:
        sensors = Sensor.objects.all()
        Cache.set_all(
            cache_key=SENSOR_LIST_CACHE_KEY,
            app_name=SENSOR_LIST_CACHE_KEY_APP_NAME,
            data=sensors,
        )
    return sensors if sensors else None


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_sensor_all(request):
    sensors = Cache.get_all(
        cache_key=SENSOR_LIST_CACHE_KEY, app_name=SENSOR_LIST_CACHE_KEY_APP_NAME
    )

    if sensors is None:
        sensors = Sensor.objects.all()
        Cache.set_all(
            cache_key=SENSOR_LIST_CACHE_KEY,
            app_name=SENSOR_LIST_CACHE_KEY_APP_NAME,
            data=sensors,
        )

    serializer = SensorSerializer(sensors, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_sensor(request):
    if User.objects.filter(
        pk=request.user.id, groups__name=GroupName.SUPERADMIN_GROUP
    ).exists():
        serializer = SensorSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        sensor = serializer.save()
        Cache.set_to_list(
            cache_key=SENSOR_LIST_CACHE_KEY,
            app_name=SENSOR_LIST_CACHE_KEY_APP_NAME,
            data=sensor,
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response(
            {"error": ERROR_PERMISSION_DENIED}, status=status.HTTP_403_FORBIDDEN
        )


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def sensor(request, name):
    if User.objects.filter(
        pk=request.user.id, groups__name=GroupName.SUPERADMIN_GROUP
    ).exists():
        sensor = Cache.get_sensor_by_name(cache_key=SENSOR_LIST_CACHE_KEY, name=name)
        if sensor is None:
            try:
                sensor = Sensor.objects.get(name=name)
                Cache.set_to_list(
                    cache_key=SENSOR_LIST_CACHE_KEY,
                    app_name=SENSOR_LIST_CACHE_KEY_APP_NAME,
                    data=sensor,
                )
            except ObjectDoesNotExist:
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
            Cache.delete_from_list(SENSOR_LIST_CACHE_KEY, sensor.id)
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == "DELETE":
            try:
                sensor.delete()
                Cache.delete_from_list(SENSOR_LIST_CACHE_KEY, sensor.id)
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


@api_view(["POST", "GET"])
@permission_classes([IsAuthenticated])
def company_sensor_add_or_get(request, company_slug):
    if User.objects.filter(
        pk=request.user.id, groups__name=GroupName.SUPERADMIN_GROUP
    ).exists():
        if request.method == "POST":
            sensor_list = get_sensor_list()
            if sensor_list is None:
                return Response(
                    ERROR_SENSOR_NOT_FOUND, status=status.HTTP_400_BAD_REQUEST
                )
            serializer = CompanySensorSerializer(
                data=request.data,
                context={
                    "sensor_list": sensor_list,
                    "company_slug": company_slug,
                    "request": request,
                },
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            # saving objects in bluk
            return Response(status=status.HTTP_201_CREATED)

        elif request.method == "GET":
            cache_key = get_company_sensor_cache_key(company_slug)
            company_sensors = Cache.get_all(
                cache_key=cache_key,
                app_name=COMPANY_SENSOR_APP_NAME,
            )
            if company_sensors is None:
                company_sensors = CompanySensor.objects.select_related(
                    "sensor", "company"
                ).filter(company__slug=company_slug)
                Cache.set_all(
                    cache_key=cache_key,
                    app_name=COMPANY_SENSOR_APP_NAME,
                    data=company_sensors,
                )
            serializer = CompanySensorSerializer(company_sensors, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

    else:
        return Response(
            {"error": ERROR_PERMISSION_DENIED}, status=status.HTTP_403_FORBIDDEN
        )


@api_view(["PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def company_sensor_update_or_delete(request, company_slug, sensor_name):
    if User.objects.filter(
        pk=request.user.id, groups__name=GroupName.SUPERADMIN_GROUP
    ).exists():
        cache_key = get_company_sensor_cache_key(company_slug)
        company_sensor = Cache.get_company_sensor_by_name(cache_key, sensor_name)
        if company_sensor is None:
            try:
                company_sensor = CompanySensor.objects.select_related(
                    "sensor", "company"
                ).get(company__slug=company_slug, sensor__name=sensor_name)
                # this view handle patch and delete request so no need to save the object in cache
                # only helpful when patch and delete request failed
                Cache.set_to_list(
                    cache_key=cache_key,
                    app_name=COMPANY_SENSOR_APP_NAME,
                    data=company_sensor,
                )
            except CompanySensor.DoesNotExist:
                return Response(
                    {"error": ERROR_SENSOR_NOT_ASSOCIATED_WITH_COMPANY},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if request.method == "PATCH":
            # get the list of all the sensor
            sensor_list = get_sensor_list()
            if sensor_list is None:
                return Response(
                    ERROR_SENSOR_NOT_FOUND, status=status.HTTP_400_BAD_REQUEST
                )

            serializer = CompanySensorSerializer(
                company_sensor,
                data=request.data,
                context={
                    "sensor_list": sensor_list,
                    "company_slug": company_slug,
                    "request": request,
                },
                partial=True,
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            Cache.delete_from_list(cache_key=cache_key, id=company_sensor.id)

            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == "DELETE":
            try:
                company_sensor.delete()
                Cache.delete_from_list(cache_key=cache_key, id=company_sensor.id)
            except ProtectedError as e:
                related_objects = e.protected_objects
                # send list of projected objects
                error_message = error_protected_delete_message(
                    company_sensor, len(related_objects)
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


@api_view(["POST", "GET"])
@permission_classes([IsAuthenticated])
def admin_user_sensor_add_or_get(request, username):
    if User.objects.filter(
        pk=request.user.id, groups__name=GroupName.SUPERADMIN_GROUP
    ).exists():
        if request.method == "POST":
            sensor_list = get_sensor_list()
            if sensor_list is None:
                return Response(
                    ERROR_SENSOR_NOT_FOUND, status=status.HTTP_400_BAD_REQUEST
                )
            serializer = AdminUserSensorSerializer(
                data=request.data,
                context={
                    "sensor_list": sensor_list,
                    "admin_user_username": username,
                    "request": request,
                },
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(status=status.HTTP_201_CREATED)

        elif request.method == "GET":
            cache_key = get_admin_user_sensor_cache_key(username)
            admin_user_sensors = Cache.get_all(
                cache_key=cache_key,
                app_name=ADMIN_USER_SENSOR_APP_NAME,
            )
            if admin_user_sensors is None:
                admin_user_sensor = AdminUserSensor.objects.select_related(
                    "sensor", "company"
                ).filter(user__username=username)

                Cache.set_all(
                    cache_key=cache_key,
                    app_name=ADMIN_USER_SENSOR_APP_NAME,
                    data=admin_user_sensor,
                )

            serializer = AdminUserSensorSerializer(admin_user_sensor, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

    else:
        return Response(
            {"error": ERROR_PERMISSION_DENIED}, status=status.HTTP_403_FORBIDDEN
        )


@api_view(["PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def admin_user_sensor_update_or_delete(request, username, sensor_name):
    if User.objects.filter(
        pk=request.user.id, groups__name=GroupName.SUPERADMIN_GROUP
    ).exists():
        cache_key = get_admin_user_sensor_cache_key(username)
        admin_user_sensor = Cache.get_company_sensor_by_name(cache_key, sensor_name)
        if admin_user_sensor is None:
            try:
                admin_user_sensor = AdminUserSensor.objects.select_related(
                    "sensor", "company"
                ).get(user__username=username, sensor__name=sensor_name)
                Cache.set_to_list(
                    cache_key=cache_key,
                    app_name=ADMIN_USER_SENSOR_APP_NAME,
                    data=admin_user_sensor,
                )
            except AdminUserSensor.DoesNotExist:
                return Response(
                    {"error": ERROR_SENSOR_NOT_ASSOCIATED_WITH_ADMIN_USER},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if request.method == "PATCH":
            sensor_list = get_sensor_list()
            if sensor_list is None:
                return Response(
                    ERROR_SENSOR_NOT_FOUND, status=status.HTTP_400_BAD_REQUEST
                )
            serializer = AdminUserSensorSerializer(
                admin_user_sensor,
                data=request.data,
                context={
                    "sensor_list": sensor_list,
                    "admin_user_username": username,
                    "request": request,
                },
                partial=True,
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            Cache.delete_from_list(cache_key=cache_key, id=admin_user_sensor.id)
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == "DELETE":
            try:
                admin_user_sensor.delete()
                Cache.delete_from_list(cache_key=cache_key, id=admin_user_sensor.id)
            except ProtectedError as e:
                related_objects = e.protected_objects
                # send list of projected objects
                error_message = error_protected_delete_message(
                    admin_user_sensor, len(related_objects)
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
