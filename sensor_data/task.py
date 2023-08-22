from celery import shared_task
from sensors.models import CompanySensor
from .serializers import SensorDataSerializer1
from django.db import transaction


@shared_task
def save_data(request_data, company_id):
    # request_data = request.data
    company_sensors = CompanySensor.objects.select_related("sensor").filter(
        company__id=company_id
    )
    serializer = SensorDataSerializer1(
        data=request_data,
        context={
            "request_data": request_data,
            "company": company_id,
            "company_sensors": company_sensors,
        },
    )
    serializer.is_valid(raise_exception=True)
    with transaction.atomic():
        serializer.save()
