import re
from collections import defaultdict
from datetime import datetime, timedelta
from io import BytesIO
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
import pandas as pd
from django.db import transaction
from django.http import HttpResponse
from django.shortcuts import render
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from company.cache import CompanyCache
from iot_devices.auth import DeviceAuthentication
from iot_devices.cache import IotDeviceCache
from sensors.cache import SensorCache
from users.cache import UserCache
from utils.commom_functions import get_groups_tuple
from utils.constants import GroupName

from .models import SensorData
from .serializers import IotDeviceSensorDataSerializer
from .tasks import send_live_data_to


def sensor_data_generator(sensor_data_qs):
    for entry in sensor_data_qs:
        iot_device_id = entry["iot_device_id"]
        sensor_name = entry.get("device_sensor__sensor__name", None)
        value = entry["value"]
        timestamp = entry["timestamp"]

        yield iot_device_id, sensor_name, value, timestamp


def process_sensor_data(sensor_data_qs, list_data_by_sensor=False):
    """List the sensor data in the required format"""
    sensors_data = (
        defaultdict(list)
        if list_data_by_sensor
        else defaultdict(lambda: defaultdict(list))
    )

    for iot_device_id, sensor_name, value, timestamp in sensor_data_generator(
        sensor_data_qs
    ):
        if list_data_by_sensor:
            sensors_data[sensor_name].append(
                {"value": value, "timestamp": timestamp, "iot_device_id": iot_device_id}
            )
        else:
            sensors_data[iot_device_id][sensor_name].append(
                {"value": value, "timestamp": timestamp}
            )

    return sensors_data


# Api handling of the Sensordata model
@api_view(["POST"])
@authentication_classes([DeviceAuthentication])
def save_sensor_data(request):
    iot_device = request.auth
    device_sensors = IotDeviceCache.get_all_device_sensors(iot_device.id)
    if not device_sensors:
        return Response(
            {"error": "No Sensor is associated with the devices"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    serializer = IotDeviceSensorDataSerializer(
        data=request.data,
        context={
            "request": request,
            "iot_device": iot_device,
            "device_sensors": device_sensors,
        },
    )
    serializer.is_valid(raise_exception=True)
    with transaction.atomic():
        serializer.save()

    username = iot_device.user.username if iot_device.user else None
    company_slug = iot_device.company.slug if iot_device.company else None
    group_name = company_slug if company_slug else username

    # sending data to the websocket
    channel_layer = get_channel_layer()
    timestamp = (
        serializer.validated_data.pop("timestamp")
        .astimezone(timezone.get_default_timezone())
        .strftime("%Y-%m-%d %H:%M:%S")
    )

    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "send_data",
            "data": serializer.validated_data,
            "device_id": iot_device.id,
            "timestamp": timestamp,
        },
    )

    # call celery for sending live data to an api end point
    send_live_data_to.delay(
        username=username,
        company_slug=company_slug,
        data=serializer.validated_data,
        iot_device_id=iot_device.id,
        board_id=iot_device.board_id,
        timestamp=timestamp,
    )

    return Response(status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_sensor_data(request):
    user = UserCache.get_user(username=request.user.username)
    user_groups = get_groups_tuple(user)
    one_month_ago = timezone.now() - timedelta(days=30)
    if GroupName.SUPERADMIN_GROUP in user_groups:
        sensor_data_qs = (
            SensorData.objects.filter(timestamp__gte=one_month_ago)
            .values(
                "device_sensor__sensor__name",
                "iot_device_id",
                "value",
                "timestamp",
            )
            .order_by("-timestamp")
        )

    else:
        # getting the list of the iot_device associated with the admin user or company
        iot_device_list = []
        if user.is_associated_with_company:
            iot_device_list = IotDeviceCache.get_all_company_iot_devices(user.company)
        elif GroupName.ADMIN_GROUP in user_groups:
            iot_device_list = IotDeviceCache.get_all_user_iot_devices(user)
        else:
            iot_device_list = IotDeviceCache.get_all_user_iot_devices(user.created_by)

        sensor_data_qs = (
            SensorData.objects.filter(
                iot_device__id__in=iot_device_list, timestamp__gte=one_month_ago
            )
            .values(
                "device_sensor__sensor__name",
                "iot_device_id",
                "value",
                "timestamp",
            )
            .order_by("-timestamp")
        )

    list_data_by_sensor = request.query_params.get("list_by", None)
    sensors_data = process_sensor_data(
        sensor_data_qs, list_data_by_sensor=(list_data_by_sensor == "sensor")
    )
    return Response(sensors_data, status=status.HTTP_200_OK)


def get_users_to_download_data(users):
    user_list = UserCache.get_all_users()
    username_set = {
        user.username
        for user in user_list
        if not user.is_associated_with_company
        and GroupName.ADMIN_GROUP in (group.name for group in user.groups.all())
    }
    if users == "all":
        return username_set
    else:
        users = set(users.split(","))
        if not users.issubset(username_set):
            return None
        else:
            return users


def get_companies_to_download_data(companies):
    company_list = CompanyCache.get_all_company()
    slug_set = {company.slug for company in company_list}
    if companies == "all":
        return slug_set
    else:
        companies = set(companies.split(","))
        if not companies.issubset(slug_set):
            return None
        else:
            return companies


def get_worksheet_name(name: str, is_user=False, is_company=False):
    """Excel doesn't support sheet name greater than 31 character"""
    if is_user:
        if len(name) > 31:
            return name[:31].capitalize()
        else:
            return name.capitalize()
    if is_company:
        remove_strings = ("private limited", "pvt ltd", "pvt. ltd.", "p.v.t l.t.d")
        # Create a regex pattern to match any of the remove_strings, case-insensitive
        pattern = re.compile("|".join(map(re.escape, remove_strings)), re.IGNORECASE)
        # Use regex sub to replace matched patterns with an empty string
        cleaned_name = pattern.sub("", name)
        if len(cleaned_name) > 31:
            return cleaned_name[:31].capitalize()
        else:
            return cleaned_name.capitalize()


def get_sensor_dict(user, user_groups, sensors: set | str):
    """Return the sensor dictionary: name and symbol as key value pair"""
    all_sensor_list = SensorCache.get_all_sensor()
    owned_sensor_list = []
    if GroupName.SUPERADMIN_GROUP in user_groups:
        owned_sensor_list = [sensor.name for sensor in all_sensor_list]
    else:
        owned_sensor_list = (
            SensorCache.get_all_company_sensor(user.company)
            if user.is_associated_with_company
            else SensorCache.get_all_user_sensor(user)
        )

    if isinstance(sensors, set) and not sensors.issubset(set(owned_sensor_list)):
        return None
    sensor_list = sensors if isinstance(sensors, set) else owned_sensor_list
    return {
        sensor.name: sensor.symbol
        for sensor in all_sensor_list
        if sensor.name in sensor_list
    }


def get_owned_iot_device_list(user):
    return (
        IotDeviceCache.get_all_company_iot_devices(company=user.company)
        if user.is_associated_with_company
        else IotDeviceCache.get_all_user_iot_devices(user=user)
    )


def get_dataframe(queryset):
    df = pd.DataFrame(
        queryset,
        columns=["Sensor Name", "Device Id", "value", "Timestamp", "Device Name"],
    )

    if df.empty:
        return None

    df.loc[(df["Sensor Name"] == "mains") & (df["value"] == 1), "value"] = "ON"
    df.loc[(df["Sensor Name"] == "mains") & (df["value"] == 0), "value"] = "OFF"

    # rounding of the values
    df["value"] = df["value"].map(
        lambda x: "{:.2f}".format(x) if isinstance(x, (int, float)) else x
    )

    # removing time zone infomation as excel doesn't support timezone aware dateTime values
    df["Timestamp"] = df["Timestamp"].dt.tz_convert("Asia/Kathmandu")
    df["Timestamp"] = df["Timestamp"].dt.tz_localize(None)

    return df


def sensor_data_to_excel(
    sensor_dict, df, writer, workbook, header_format, value_column_format
):
    for sensor, unit in sensor_dict.items():
        sensor_df = df.loc[lambda df: df["Sensor Name"] == sensor]
        if sensor_df.empty:
            continue
        worksheet_name = sensor.capitalize()
        worksheet = workbook.add_worksheet(worksheet_name)
        header_text = (
            f"{worksheet_name} Sensor Data in {unit}"
            if unit
            else f"{worksheet_name} Sensor Data"
        )
        worksheet.merge_range(0, 0, 0, 2, header_text, header_format)

        sensor_df.to_excel(
            writer,
            sheet_name=worksheet_name,
            index=False,
            startrow=1,
            columns=["value", "Timestamp", "Device Name"],
        )

        worksheet.set_column(0, 0, 15, value_column_format)
        worksheet.set_column(1, 2, 30)
        # worksheet.set_column(2, 2, 15)


def users_and_company_data_to_excel(
    sensor_list,
    sensor_dict,
    df,
    writer,
    worksheet,
    worksheet_name,
    header_format,
    value_column_format,
):
    start_column = 0
    end_column = 2
    for sensor in sensor_list:
        if sensor in sensor_dict:
            sensor_df = df.loc[lambda df: df["Sensor Name"] == sensor]
            if not sensor_df.empty:
                sensor_name = sensor.capitalize()
                unit = sensor_dict[sensor]
                header_text = (
                    f"{sensor_name} Sensor Data in {sensor_dict[sensor]}"
                    if unit
                    else f"{sensor_name} Sensor Data"
                )
                worksheet.merge_range(
                    0,
                    start_column,
                    0,
                    end_column,
                    header_text,
                    header_format,
                )
                sensor_df.to_excel(
                    writer,
                    sheet_name=worksheet_name,
                    index=False,
                    startrow=1,
                    startcol=start_column,
                    columns=["value", "Timestamp", "Device Name"],
                )

                worksheet.set_column(
                    start_column, start_column, 15, value_column_format
                )
                worksheet.set_column(start_column + 1, start_column + 2, 30)
                # worksheet.set_column(start_column + 2, start_column + 2, 15)
                start_column = end_column + 2
                end_column = end_column + 2 + 2


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def download_sensor_data(request):
    user = UserCache.get_user(username=request.user.username)
    user_groups = get_groups_tuple(user)
    if not any(
        group_name in user_groups
        for group_name in (
            GroupName.ADMIN_GROUP,
            GroupName.SUPERADMIN_GROUP,
        )
    ):
        return Response(
            {"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN
        )

    start_date = request.query_params.get("start_date", None)
    end_date = request.query_params.get("end_date", None)
    sensors = request.query_params.get("sensors", None)
    file_type = request.query_params.get("file_type", None)

    if file_type is None or not file_type in ("excel", "csv"):
        return Response(
            {
                "error": "Invalid/Unspecified format! file-format must be either 'excel' or 'csv'."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        start_date = datetime.strptime(start_date, "%Y-%m-%d")
        end_date = datetime.strptime(end_date, "%Y-%m-%d").replace(
            hour=23, minute=59, second=59, microsecond=999999
        )
    except ValueError:
        return Response(
            {"error": "Invalid date format! format must be YYYY-MM-DD"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if start_date > end_date:
        return Response(
            {"error": "Invalid Start date! Start date must be smaller than End Date"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if sensors and sensors != "all":
        sensors = set(sensors.split(","))

    sensor_dict = get_sensor_dict(user, user_groups, sensors)

    if sensor_dict is None:
        return Response(
            {
                "error": "Invalid Sensor! A sensor provided which is not owned by the entity"
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    sensor_data = (
        SensorData.objects.select_related("iot_device")
        .filter(
            timestamp__range=(start_date, end_date),
        )
        .values_list(
            "device_sensor__sensor__name",
            "iot_device_id",
            "value",
            "timestamp",
            "iot_device__iot_device_details__name",
        )
        .order_by("-timestamp", "iot_device")
    )

    if GroupName.ADMIN_GROUP in user_groups:
        if start_date < (datetime.now() - timedelta(days=30)):
            return Response(
                {
                    "error": "Invalid Start date! Start date must not be earlier than 1 month from the current date."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        owned_iot_device_list = get_owned_iot_device_list(user)

        sensor_data_qs = sensor_data.filter(
            timestamp__range=(start_date, end_date),
            iot_device__in=owned_iot_device_list,
        )

        df = get_dataframe(sensor_data_qs)

        if df is None:
            return Response(
                {"message": "No data is present to download"},
                status=status.HTTP_204_NO_CONTENT,
            )

        bio = BytesIO()
        if file_type == "excel":
            with pd.ExcelWriter(
                bio,
                engine="xlsxwriter",
                datetime_format="mmm d yyyy hh:mm:ss",
            ) as writer:
                workbook = writer.book
                value_column_format = workbook.add_format({"num_format": "0.00"})
                header_format = workbook.add_format(
                    {"align": "center", "bold": True, "font_size": 12}
                )

                sensor_data_to_excel(
                    sensor_dict,
                    df,
                    writer,
                    workbook,
                    header_format,
                    value_column_format,
                )
        else:
            # file type is equal to csv
            df.sort_values(
                by=["Sensor Name", "Timestamp"],
                ascending=[True, False],
                inplace=True,
                ignore_index=True,
            )
            df["Timestamp"] = df["Timestamp"].dt.strftime("%b %d %Y %H:%M:%S")
            df.to_csv(
                bio,
                index=False,
                float_format="%.2f",
                columns=["Sensor Name", "Timestamp", "value", "Device Name"],
            )

    else:
        # user is super-admin user
        users = request.query_params.get("user", None)
        companies = request.query_params.get("company", None)

        if companies:
            companies = get_companies_to_download_data(companies)
            if companies is None:
                return Response(
                    {
                        "error": "Invalid Company! A company provided which is not in our system."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if users:
            users = get_users_to_download_data(users)
            if users is None:
                return Response(
                    {
                        "error": "Invalid user! A user provided which is not an Admin User."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        df = get_dataframe(sensor_data)
        if df is None:
            return Response(
                {"message": "No data is present to download"},
                status=status.HTTP_204_NO_CONTENT,
            )

        bio = BytesIO()
        if file_type == "excel":
            with pd.ExcelWriter(
                bio,
                engine="xlsxwriter",
                datetime_format="mmm d yyyy hh:mm:ss",
            ) as writer:
                workbook = writer.book
                value_column_format = workbook.add_format({"num_format": "0.00"})
                header_format = workbook.add_format(
                    {"align": "center", "bold": True, "font_size": 12}
                )
                if users:
                    for username in users:
                        iot_device_list = IotDeviceCache.get_all_user_iot_devices(
                            username=username
                        )
                        users_df = df[df["Device Id"].isin(iot_device_list)]
                        if not users_df.empty:
                            user = UserCache.get_user(username)
                            user_owned_sensor_list = SensorCache.get_all_user_sensor(
                                user=user
                            )
                            name = f"{user.profile.first_name} {user.profile.last_name}"
                            worksheet_name = get_worksheet_name(name, is_user=True)
                            worksheet = workbook.add_worksheet(worksheet_name)
                            users_and_company_data_to_excel(
                                user_owned_sensor_list,
                                sensor_dict,
                                users_df,
                                writer,
                                worksheet,
                                worksheet_name,
                                header_format,
                                value_column_format,
                            )
                if companies:
                    for slug in companies:
                        iot_device_list = IotDeviceCache.get_all_company_iot_devices(
                            company_slug=slug
                        )
                        company_df = df[df["Device Id"].isin(iot_device_list)]
                        if not company_df.empty:
                            company = CompanyCache.get_company(slug)
                            company_owned_sensor_list = (
                                SensorCache.get_all_company_sensor(company=company)
                            )

                            worksheet_name = get_worksheet_name(
                                company.name, is_company=True
                            )
                            worksheet = workbook.add_worksheet(worksheet_name)
                            users_and_company_data_to_excel(
                                company_owned_sensor_list,
                                sensor_dict,
                                company_df,
                                writer,
                                worksheet,
                                worksheet_name,
                                header_format,
                                value_column_format,
                            )
                if users is None and companies is None:
                    sensor_data_to_excel(
                        sensor_dict,
                        df,
                        writer,
                        workbook,
                        header_format,
                        value_column_format,
                    )

            if pd.read_excel(bio, nrows=2).empty:
                return Response(
                    {"message": "No data is present to download"},
                    status=status.HTTP_204_NO_CONTENT,
                )
        else:
            # file type is equal to csv
            df = df[df["Sensor Name"].isin(sensor_dict.keys())]
            if users is None and companies is None:
                df.sort_values(
                    by=["Sensor Name", "Timestamp"],
                    inplace=True,
                    ascending=[True, False],
                    ignore_index=True,
                )
                df["Timestamp"] = df["Timestamp"].dt.strftime("%b %d %Y %H:%M:%S")
                df.to_csv(
                    bio,
                    index=False,
                    float_format="%.2f",
                    columns=["Sensor Name", "Timestamp", "value", "Device Name"],
                )

            else:
                if users:
                    df["User"] = None
                    for username in users:
                        iot_device_list = IotDeviceCache.get_all_user_iot_devices(
                            username=username
                        )
                        users_mask = df["Device Id"].isin(iot_device_list)
                        if any(users_mask):
                            user = UserCache.get_user(username)
                            user_name = (
                                f"{user.profile.first_name} {user.profile.last_name}"
                                if user.profile.first_name
                                else username
                            )
                            df.loc[users_mask, "User"] = user_name

                if companies:
                    df["Company"] = None
                    for slug in companies:
                        iot_device_list = IotDeviceCache.get_all_company_iot_devices(
                            company_slug=slug
                        )
                        company_mask = df["Device Id"].isin(iot_device_list)
                        if any(company_mask):
                            company = CompanyCache.get_company(slug)
                            company_name = company.name
                            df.loc[company_mask, "Company"] = company_name

                columns = [
                    "Sensor Name",
                    "Timestamp",
                    "value",
                    "Device Name",
                ]

                is_company_value_present = df["Company"].any() if companies else None
                is_user_value_present = df["User"].any() if users else None

                if not is_company_value_present and not is_user_value_present:
                    return Response(
                        {"message": "No data is present to download"},
                        status=status.HTTP_204_NO_CONTENT,
                    )
                elif is_company_value_present and is_user_value_present:
                    columns.extend(["User", "Company"])

                elif is_company_value_present:
                    columns.append("Company")
                elif is_user_value_present:
                    columns.append("User")

                if is_company_value_present and is_user_value_present:
                    df.dropna(
                        subset=["User", "Company"],
                        how="all",
                        inplace=True,
                        ignore_index=True,
                    )

                    df.sort_values(
                        by=["User", "Company", "Sensor Name", "Timestamp"],
                        ascending=[True, True, True, False],
                        inplace=True,
                        ignore_index=True,
                    )

                elif is_company_value_present:
                    df.dropna(
                        subset=["Company"],
                        how="all",
                        inplace=True,
                        ignore_index=True,
                    )

                    df.sort_values(
                        by=["Company", "Sensor Name", "Timestamp"],
                        ascending=[True, True, False],
                        inplace=True,
                        ignore_index=True,
                    )

                elif is_user_value_present:
                    df.dropna(
                        subset=["User"],
                        how="all",
                        inplace=True,
                        ignore_index=True,
                    )

                    df.sort_values(
                        by=["User", "Sensor Name", "Timestamp"],
                        ascending=[True, True, False],
                        inplace=True,
                        ignore_index=True,
                    )

                df["Timestamp"] = df["Timestamp"].dt.strftime("%b %d %Y %H:%M:%S")
                df.to_csv(
                    bio,
                    index=False,
                    float_format="%.2f",
                    columns=columns,
                )

    # Seek to the beginning and read/or getValue to copy the workbook to a variable in memory
    bio.seek(0)
    downloadable_file = bio.getvalue()
    content_type = "application/ms-excel" if file_type == "excel" else "text/csv"
    file_name = "sensor_data.xlsx" if file_type == "excel" else "sensor_data.csv"
    response = HttpResponse(
        downloadable_file,
        content_type=content_type,
    )
    response["Content-Disposition"] = f"attachment; filename={file_name}"

    return response
