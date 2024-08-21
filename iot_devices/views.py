from django.db.models import ProtectedError
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from iot_devices.cache import IotDeviceCache
from sensors.cache import SensorCache
from users.cache import UserCache
from utils.commom_functions import get_groups_tuple
from utils.constants import GroupName
from utils.error_message import ERROR_DEVICE_NOT_FOUND, ERROR_PERMISSION_DENIED

from .models import IotDevice
from .serializers import (
    IotDeviceDetailSerializer,
    IotDeviceSensorSerializer,
    IotDeviceSerializer,
)


# Create your views here.
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_iot_device(request):
    user = UserCache.get_user(username=request.user.username)
    user_groups = get_groups_tuple(user)
    if GroupName.SUPERADMIN_GROUP in user_groups:
        serializer = IotDeviceSerializer(
            data=request.data,
            context={
                "request": request,
            },
        )
        serializer.is_valid(raise_exception=True)
        iot_device = serializer.save()
        IotDeviceCache.set_iot_device(iot_device)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response(
            {"error": ERROR_PERMISSION_DENIED}, status=status.HTTP_403_FORBIDDEN
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def iot_device_list_all(request):
    user = UserCache.get_user(username=request.user.username)
    user_groups = get_groups_tuple(user)
    iot_devices = IotDeviceCache.get_all_iot_devices()

    if GroupName.DEALER_GROUP in user_groups:
        iot_device_list = IotDeviceCache.dealer_associated_iot_device(user.dealer)
        iot_devices = iot_devices.filter(id__in=iot_device_list)

    elif not GroupName.SUPERADMIN_GROUP in user_groups:
        iot_device_list = []
        if user.company:
            iot_device_list = IotDeviceCache.get_all_company_iot_devices(user.company)
        elif user.type == "ADMIN":
            iot_device_list = IotDeviceCache.get_all_user_iot_devices(user)
        else:
            # user is of type Viewer or Moderator
            iot_device_list = IotDeviceCache.get_all_user_iot_devices(user.created_by)
        iot_devices = iot_devices.filter(id__in=iot_device_list)

    serializer = IotDeviceSerializer(
        iot_devices, many=True, context={"request": request}
    )
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def iot_device(request, id):
    user = UserCache.get_user(username=request.user.username)
    user_groups = get_groups_tuple(user)
    is_super_admin_user = GroupName.SUPERADMIN_GROUP in user_groups
    is_dealer_user = GroupName.DEALER_GROUP in user_groups

    if is_dealer_user and request.method != "PATCH":
        return Response(
            {"error": ERROR_PERMISSION_DENIED}, status=status.HTTP_403_FORBIDDEN
        )

    if is_super_admin_user or is_dealer_user:
        iot_device = IotDeviceCache.get_iot_device(id)
        if iot_device is None:
            return Response(
                {"error": ERROR_DEVICE_NOT_FOUND},
                status=status.HTTP_404_NOT_FOUND,
            )

        if request.method == "GET":
            serializer = IotDeviceSerializer(iot_device, context={"request": request})
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == "PATCH":
            serializer = IotDeviceSerializer(
                iot_device,
                data=request.data,
                partial=True,
                context={
                    "request": request,
                    "is_super_admin_user": is_super_admin_user,
                    "is_dealer_user": is_dealer_user,
                    "requested_user": user,
                    "dealer": user.dealer,
                },
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            IotDeviceCache.delete_iot_device(
                iot_device_id=iot_device.id,
                company_slug=iot_device.company.slug if iot_device.company else None,
                username=iot_device.user.username if iot_device.user else None,
            )
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == "DELETE":
            try:
                username = iot_device.user.username if iot_device.user else None
                company_slug = iot_device.company.slug if iot_device.company else None
                iot_device.delete()
                IotDeviceCache.delete_iot_device(
                    iot_device_id=id,
                    system_delete=True,
                    username=username,
                    company_slug=company_slug,
                )
            except ProtectedError as e:
                related_objects_details = [
                    obj._meta.verbose_name for obj in e.protected_objects
                ]
                detailed_error_message = (
                    f"{ERROR_PERMISSION_DENIED} "
                    f"The following related objects are preventing the deletion: {related_objects_details}"
                )
                return Response(
                    {"error": detailed_error_message},
                    status=status.HTTP_403_FORBIDDEN,
                )
            return Response(status=status.HTTP_204_NO_CONTENT)

    else:
        return Response(
            {"error": ERROR_PERMISSION_DENIED}, status=status.HTTP_403_FORBIDDEN
        )


@api_view(["POST", "GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def device_sensor(request, device_id):
    user = UserCache.get_user(username=request.user.username)
    user_groups = get_groups_tuple(user)
    if GroupName.SUPERADMIN_GROUP in user_groups:
        # checking if the provided device id is valid
        iot_device = IotDeviceCache.get_iot_device(device_id)
        if iot_device is None:
            return Response({"error": ERROR_DEVICE_NOT_FOUND})

        # getting all the device sensor associated with the device
        device_sensors = IotDeviceCache.get_all_device_sensors(device_id)
        if request.method == "GET":
            serializer = IotDeviceSensorSerializer(device_sensors, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == "POST":
            sensors_list = SensorCache.get_all_sensor()
            serializer = IotDeviceSensorSerializer(
                data=request.data,
                context={
                    "iot_device": iot_device,
                    "device_sensors": device_sensors,
                    "sensor_list": sensors_list,
                    "request": request,
                },
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            IotDeviceCache.delete_device_sensors(device_id)
            return Response(
                {"message": "Sensors were sucessfully associated with the device"},
                status=status.HTTP_201_CREATED,
            )

        elif request.method == "PATCH":
            sensors_list = SensorCache.get_all_sensor()
            serializer = IotDeviceSensorSerializer(
                data=request.data,
                context={
                    "device_sensors": device_sensors,
                    "iot_device": iot_device,
                    "sensor_list": sensors_list,
                    "request": request,
                },
                partial=True,
            )
            serializer.is_valid(raise_exception=True)
            new_device_sensors = serializer.update_in_bulk(serializer.validated_data)
            IotDeviceCache.delete_device_sensors(device_id)
            serializering = IotDeviceSensorSerializer(new_device_sensors, many=True)
            return Response(serializering.data, status=status.HTTP_200_OK)

        elif request.method == "DELETE":
            # receive the dictionary and delete the objects.
            delete_fieldname_sensor_list = request.data.get("delete_fieldname_sensor")

            serializer = IotDeviceSensorSerializer()
            serializer.check_empty_dict(
                delete_fieldname_sensor_list, name="delete_fieldname_sensor"
            )
            serializer.check_dict_keys_pattern(delete_fieldname_sensor_list)
            error_list = []

            for device_sensor in device_sensors:
                if device_sensor.field_name in delete_fieldname_sensor_list:
                    try:
                        device_sensor.delete()
                    except ProtectedError:
                        error_list.append(device_sensor.sensor.name)
            IotDeviceCache.delete_device_sensors(device_id)
            if error_list:
                error_sensors = ",".join(error_list)
                return Response(
                    {
                        "error": f"Cannot delete sensor(s) {error_sensors} with associated data."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            return Response(status=status.HTTP_204_NO_CONTENT)
    else:
        return Response(
            {"error": ERROR_PERMISSION_DENIED}, status=status.HTTP_403_FORBIDDEN
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_all_device_sensor(request):
    user = UserCache.get_user(username=request.user.username)
    user_groups = get_groups_tuple(user)
    if GroupName.SUPERADMIN_GROUP in user_groups:
        company_slug = request.query_params.get("company")
        username = request.query_params.get("user")
        if not company_slug and not username:
            return Response(
                {"error": "No company or User specified "},
                status=status.HTTP_400_BAD_REQUEST,
            )
        iot_devices = (
            IotDeviceCache.get_all_company_iot_devices(company_slug=company_slug)
            if company_slug
            else IotDeviceCache.get_all_user_iot_devices(username=username)
        )

        if iot_devices is None:
            return Response(
                {"error": "No Iot Device found with specified company or user"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        iot_device_sensors = {}
        for device_id in iot_devices:
            device_sensors = IotDeviceCache.get_all_device_sensors(device_id)
            serializer = IotDeviceSensorSerializer(device_sensors, many=True)
            iot_device_sensors[device_id] = serializer.data
        return Response(iot_device_sensors, status=status.HTTP_200_OK)
    else:
        return Response(
            {"error": ERROR_PERMISSION_DENIED}, status=status.HTTP_403_FORBIDDEN
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_device_sensor(request, device_id):
    user = UserCache.get_user(username=request.user.username)
    user_groups = get_groups_tuple(user)
    if GroupName.SUPERADMIN_GROUP in user_groups:
        iot_device = IotDeviceCache.get_iot_device(device_id)

        if iot_device is None:
            return Response(
                {"error": "Iot Device not found"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        device_sensors = IotDeviceCache.get_all_device_sensors(device_id)
        serializer = IotDeviceSensorSerializer(device_sensors, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        return Response(
            {"error": ERROR_PERMISSION_DENIED}, status=status.HTTP_403_FORBIDDEN
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_iot_device_api_key(request, device_id):
    user = UserCache.get_user(username=request.user.username)
    user_groups = get_groups_tuple(user)
    if GroupName.SUPERADMIN_GROUP in user_groups:
        try:
            iot_device = IotDevice.objects.only("api_key").get(pk=device_id)
        except IotDevice.DoesNotExist:
            return Response(
                {"error": ERROR_DEVICE_NOT_FOUND},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response({"api_key": iot_device.api_key}, status=status.HTTP_200_OK)

    else:
        return Response(
            {"error": ERROR_PERMISSION_DENIED}, status=status.HTTP_403_FORBIDDEN
        )


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def iot_device_detail(request, device_id):
    user = UserCache.get_user(username=request.user.username)
    user_groups = get_groups_tuple(user)
    if any(
        group_name in user_groups
        for group_name in (GroupName.ADMIN_GROUP, GroupName.SUPERADMIN_GROUP)
    ):
        iot_device = IotDeviceCache.get_iot_device(device_id)
        if iot_device is None:
            return Response(
                {"error": ERROR_DEVICE_NOT_FOUND},
                status=status.HTTP_404_NOT_FOUND,
            )

        if GroupName.ADMIN_GROUP in user_groups:
            iot_device_list = []
            if GroupName.DEALER_GROUP in user_groups:
                iot_device_list = IotDeviceCache.dealer_associated_iot_device(
                    user.dealer
                )

            else:
                iot_device_list = (
                    IotDeviceCache.get_all_company_iot_devices(user.company)
                    if user.is_associated_with_company
                    else IotDeviceCache.get_all_user_iot_devices(user)
                )
            if device_id not in iot_device_list:
                return Response(
                    {
                        "error": "Invalid Device Id! The provided device id does not match registered ownership."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        serializer = IotDeviceDetailSerializer(
            iot_device.iot_device_details,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        IotDeviceCache.delete_iot_device(
            iot_device_id=iot_device.id,
            company_slug=iot_device.company.slug if iot_device.company else None,
            username=iot_device.user.username if iot_device.user else None,
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

    else:
        return Response(
            {"error": ERROR_PERMISSION_DENIED}, status=status.HTTP_403_FORBIDDEN
        )
