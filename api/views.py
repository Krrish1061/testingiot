from datetime import timedelta
from django.core.paginator import EmptyPage, PageNotAnInteger
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes
from rest_framework.response import Response
from iot_devices.cache import IotDeviceCache

from sensor_data.models import SensorData
from sensor_data.pagination import SensorDataPaginator
from sensors.cache import SensorCache
from users.auth import ApiKeyAuthentication


# Create your views here.
@api_view(["GET"])
@authentication_classes([ApiKeyAuthentication])
def get_sensor_data(request):
    user = request.user

    sensor_list = (
        SensorCache.get_all_company_sensor(user.company)
        if user.is_associated_with_company
        else SensorCache.get_all_user_sensor(user)
    )
    iot_device_list = (
        IotDeviceCache.get_all_company_iot_devices(user.company)
        if user.is_associated_with_company
        else IotDeviceCache.get_all_user_iot_devices(user)
    )

    one_month_ago = timezone.now() - timedelta(days=30)

    sensor_data_qs = (
        SensorData.objects.select_related("iot_device", "device_sensor")
        .filter(iot_device__id__in=iot_device_list)
        .values("iot_device_id", "value", "timestamp")
        .filter(timestamp__gte=one_month_ago)
        .order_by("-timestamp")
    )

    try:
        page_size = int(request.query_params["page_size"])
    except (KeyError, ValueError):
        page_size = 25

    list_data_by_sensor = request.query_params.get("list_by", None)

    paginator = SensorDataPaginator(
        sensor_data_qs,
        page_size,
        sensor_names=sensor_list,
        iot_device_list=iot_device_list,
        list_data_by_sensor=(list_data_by_sensor == "sensor"),
    )

    try:
        page_number = int(request.query_params["page"])
    except (KeyError, ValueError):
        page_number = 1

    try:
        page = paginator.page(page_number, request)
    except (EmptyPage, PageNotAnInteger):
        return Response(
            {"error": "Invalid page Number or EmptyPage"},
            status=status.HTTP_404_NOT_FOUND,
        )

    response = {
        "count": paginator.count,
        "total-pages": paginator.num_pages,
        "next": paginator.get_next_link(page=page, request=request),
        "previous": paginator.get_previous_link(page=page, request=request),
        "results": page.object_list,
    }

    return Response(response)
