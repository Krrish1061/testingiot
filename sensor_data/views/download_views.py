import re
from datetime import datetime, timedelta
from io import BytesIO

import pandas as pd
from django.http import HttpResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from company.cache import CompanyCache
from iot_devices.cache import IotDeviceCache
from sensor_data.models import SensorData
from sensors.cache import SensorCache
from users.cache import UserCache
from utils.commom_functions import get_groups_tuple
from utils.constants import GroupName


def get_owned_iot_device_list(user):
    return (
        IotDeviceCache.get_all_company_iot_devices(company=user.company)
        if user.is_associated_with_company
        else IotDeviceCache.get_all_user_iot_devices(user=user)
    )


def get_and_validate_date(start_date, end_date, is_user_superadmin):
    date_error_message = ""
    try:
        start_date = datetime.strptime(start_date, "%Y-%m-%d")
        end_date = datetime.strptime(end_date, "%Y-%m-%d").replace(
            hour=23, minute=59, second=59, microsecond=999999
        )
    except ValueError:
        date_error_message = "Invalid date format! format must be YYYY-MM-DD"

    if start_date > end_date:
        date_error_message = (
            "Invalid Start date! Start date must be smaller than End Date"
        )

    if not is_user_superadmin and (
        start_date.date() < (datetime.now() - timedelta(days=30)).date()
    ):
        date_error_message = "Invalid Start date! Start date must not be earlier than 1 month from the current date."

    return (start_date, end_date, date_error_message)


def get_and_validate_iot_device(user, user_groups, iot_device):
    """
    Checks IoT device validation and returns the set of IoT devices or an error message.
    Superadmin users can access all devices.

    Args:
        user: The user object containing user details.
        user_groups: A list of groups the user belongs to.
        iot_device: A string of comma-separated IoT device IDs or "all".

    Returns:
        tuple: A tuple containing:
            - set or str: A set of validated IoT device IDs, or "all" for superadmin users.
            - str: An error message if validation fails, otherwise an empty string.
    """
    if not iot_device:
        return (None, "Iot device is not provided!")

    iot_Device_error_message = ""
    if iot_device != "all":
        try:
            iot_device = {int(device_id) for device_id in iot_device.split(",")}
        except ValueError:
            return (None, "Invalid! IoT device provided")

    if GroupName.SUPERADMIN_GROUP not in user_groups:
        owned_iot_device = []
        if GroupName.DEALER_GROUP in user_groups:
            owned_iot_device = IotDeviceCache.dealer_associated_iot_device(
                dealer=user.dealer
            )
        else:
            owned_iot_device = get_owned_iot_device_list(user)

        if iot_device == "all":
            iot_device = set(owned_iot_device)

        elif not iot_device.issubset(set(owned_iot_device)):
            iot_device = None
            iot_Device_error_message = (
                "Permission denied! Unknown iot Device is provided"
            )

    return (iot_device, iot_Device_error_message)


def get_users_to_download_data(users, user, is_user_superadmin=False):
    """Return the user list for superadmin user and dealer user"""
    user_list = (
        UserCache.get_all_users()
        if is_user_superadmin
        else UserCache.dealer_associated_user(user.dealer)
    )
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


def get_companies_to_download_data(companies, user, is_user_superadmin=False):
    """Return the company list for superadmin user and dealer user"""
    company_list = (
        CompanyCache.get_all_company()
        if is_user_superadmin
        else CompanyCache.dealer_associated_company(user.dealer)
    )
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
    elif GroupName.DEALER_GROUP in user_groups:
        owned_sensor_list = SensorCache.get_all_dealer_sensor(user.dealer)
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
    sensor_dict, df, writer, workbook, header_format, value_column_format, mains_format
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
        if sensor == "mains":
            (max_row, _) = sensor_df.shape
            worksheet.conditional_format(
                2,
                0,
                max_row + 2,
                0,
                {
                    "type": "cell",
                    "criteria": "==",
                    "value": '"OFF"',
                    "format": mains_format,
                },
            )

        worksheet.set_column(0, 0, 15, value_column_format)
        worksheet.set_column(1, 2, 30)

        sensor_df.to_excel(
            writer,
            sheet_name=worksheet_name,
            index=False,
            startrow=1,
            columns=["value", "Timestamp", "Device Name"],
        )


def users_and_company_data_to_excel(
    sensor_list,
    sensor_dict,
    df,
    writer,
    worksheet,
    worksheet_name,
    header_format,
    value_column_format,
    mains_format,
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

                if sensor == "mains":
                    (max_row, _) = sensor_df.shape
                    worksheet.conditional_format(
                        2,
                        start_column,
                        max_row + 2,
                        start_column,
                        {
                            "type": "cell",
                            "criteria": "==",
                            "value": '"OFF"',
                            "format": mains_format,
                        },
                    )

                worksheet.set_column(
                    start_column, start_column, 15, value_column_format
                )
                worksheet.set_column(start_column + 1, start_column + 2, 30)

                sensor_df.to_excel(
                    writer,
                    sheet_name=worksheet_name,
                    index=False,
                    startrow=1,
                    startcol=start_column,
                    columns=["value", "Timestamp", "Device Name"],
                )

                start_column = end_column + 2
                end_column = end_column + 2 + 2


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def download_sensor_data(request):
    user = UserCache.get_user(username=request.user.username)
    user_groups = get_groups_tuple(user)
    is_user_superadmin = GroupName.SUPERADMIN_GROUP in user_groups
    if not any(
        group_name in user_groups
        for group_name in (
            GroupName.ADMIN_GROUP,
            GroupName.SUPERADMIN_GROUP,
            GroupName.MODERATOR_GROUP,
        )
    ):
        return Response(
            {"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN
        )

    if not user.is_associated_with_company and GroupName.MODERATOR_GROUP in user_groups:
        user = UserCache.get_user(username=user.created_by)

    start_date = request.query_params.get("start_date", None)
    end_date = request.query_params.get("end_date", None)
    sensors = request.query_params.get("sensors", None)
    iot_device = request.query_params.get("iot_device", None)
    file_type = request.query_params.get("file_type", None)

    if file_type is None or not file_type in ("excel", "csv"):
        return Response(
            {
                "error": "Invalid/Unspecified format! file-format must be either 'excel' or 'csv'."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    start_date, end_date, date_error_message = get_and_validate_date(
        start_date, end_date, is_user_superadmin
    )

    if date_error_message:
        return Response(
            {"error": date_error_message},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if sensors and sensors != "all":
        sensors = set(sensors.split(","))

    iot_device, iot_device_error_message = get_and_validate_iot_device(
        user, user_groups, iot_device
    )

    if iot_device_error_message:
        return Response(
            {"error": iot_device_error_message},
            status=status.HTTP_400_BAD_REQUEST,
        )

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

    if isinstance(iot_device, set):
        sensor_data = sensor_data.filter(
            iot_device__in=iot_device,
        )

    if any(
        group_name in user_groups
        for group_name in (
            GroupName.DEALER_GROUP,
            GroupName.SUPERADMIN_GROUP,
        )
    ):
        users = request.query_params.get("user", None)
        companies = request.query_params.get("company", None)
        device_list = []
        device_dict = {}
        if companies:
            companies = get_companies_to_download_data(
                companies, user, is_user_superadmin
            )
            if companies is None:
                return Response(
                    {
                        "error": "Invalid Company! A company provided which is not in our system."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            for slug in companies:
                iot_device_list = IotDeviceCache.get_all_company_iot_devices(
                    company_slug=slug
                )
                device_list.extend(iot_device_list)
                device_dict[slug] = iot_device_list

        if users:
            users = get_users_to_download_data(users, user, is_user_superadmin)
            if users is None:
                return Response(
                    {
                        "error": "Invalid user! A user provided which is not an Admin User."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            for username in users:
                iot_device_list = IotDeviceCache.get_all_user_iot_devices(
                    username=username
                )
                device_list.extend(iot_device_list)
                device_dict[username] = iot_device_list

        if users or companies:
            sensor_data = sensor_data.filter(iot_device__in=device_list)

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
                mains_format = workbook.add_format({"bg_color": "red"})
                header_format = workbook.add_format(
                    {"align": "center", "bold": True, "font_size": 12}
                )
                if users:
                    for username in users:
                        iot_device_list = device_dict[username]
                        users_df = df[df["Device Id"].isin(iot_device_list)]
                        if not users_df.empty:
                            user = UserCache.get_user(username)
                            user_owned_sensor_list = SensorCache.get_all_user_sensor(
                                user=user
                            )
                            name = (
                                f"{user.profile.first_name} {user.profile.last_name}"
                                if user.profile.first_name
                                else username
                            )
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
                                mains_format,
                            )
                if companies:
                    for slug in companies:
                        iot_device_list = device_dict[slug]
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
                                mains_format,
                            )
                if users is None and companies is None:
                    sensor_data_to_excel(
                        sensor_dict,
                        df,
                        writer,
                        workbook,
                        header_format,
                        value_column_format,
                        mains_format,
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
                        iot_device_list = device_dict[username]
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
                        iot_device_list = device_dict[slug]
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

    elif any(
        group_name in user_groups
        for group_name in (
            GroupName.ADMIN_GROUP,
            GroupName.MODERATOR_GROUP,
        )
    ):
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
                mains_format = workbook.add_format({"bg_color": "red"})
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
                    mains_format,
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
