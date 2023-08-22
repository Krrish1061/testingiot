from datetime import timedelta
from django.core.paginator import EmptyPage, PageNotAnInteger
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import (
    api_view,
    authentication_classes,
)
from sensor_data.models import (
    CompanySensorData,
    CompanySensor,
    AdminUserSensorData,
    AdminUserSensor,
)
from sensor_data.pagination import SensorDataPaginator
from rest_framework.response import Response
from users.auth import ApiKeyAuthentication


# Create your views here.
@api_view(["GET"])
@authentication_classes([ApiKeyAuthentication])
def get_sensor_data(request):
    user = request.user
    is_associated_with_company = True if user.is_associated_with_company else False
    if is_associated_with_company:
        company_sensor = (
            CompanySensor.objects.select_related("sensor")
            .filter(company=request.user.company)
            .values("id", "sensor__name")
        )

        sensor_names = {sensor__name["sensor__name"] for sensor__name in company_sensor}
        one_month_ago = timezone.now() - timedelta(days=30)

        sensor_data_qs = (
            CompanySensorData.objects.select_related("iot_device", "company_sensor")
            .filter(company_sensor__id__in=company_sensor.values("id"))
            .values("iot_device_id", "value", "timestamp")
            .filter(timestamp__gte=one_month_ago)
            .order_by("-timestamp")
        )

    else:
        admin_user_sensor = (
            AdminUserSensor.objects.select_related("sensor")
            .filter(user=request.user)
            .values("id", "sensor__name")
        )

        sensor_names = {
            sensor__name["sensor__name"] for sensor__name in admin_user_sensor
        }
        one_month_ago = timezone.now() - timedelta(days=30)

        sensor_data_qs = (
            AdminUserSensorData.objects.select_related("iot_device", "user_sensor")
            .filter(user_sensor__id__in=admin_user_sensor.values("id"))
            .values("iot_device_id", "value", "timestamp")
            .filter(timestamp__gte=one_month_ago)
            .order_by("-timestamp")
        )

    try:
        page_size = int(request.query_params["page_size"])
    except (KeyError, ValueError):
        page_size = 25

    paginator = SensorDataPaginator(
        sensor_data_qs,
        page_size,
        sensor_names=sensor_names,
        is_associated_with_company=is_associated_with_company,
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
