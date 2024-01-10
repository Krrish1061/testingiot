from django.db.models import ProtectedError
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from company.cache import CompanyCache
from users.cache import UserCache
from utils.commom_functions import get_groups_tuple
from utils.constants import GroupName
from utils.error_message import (
    ERROR_INVALID_URL,
    ERROR_PERMISSION_DENIED,
    error_protected_delete_message,
)


from .serializers import CompanyProfileSerializer, CompanySerializer
from .utils import is_slugId_ofSameInstance

from django.core.validators import validate_email
from django.core.exceptions import ValidationError


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def company_list_all(request):
    user = UserCache.get_user(username=request.user.username)
    user_groups = get_groups_tuple(user)
    if GroupName.SUPERADMIN_GROUP in user_groups:
        companies = CompanyCache.get_all_company()
        serializer = CompanySerializer(
            companies, many=True, context={"request": request}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        return Response(
            {"error": ERROR_PERMISSION_DENIED}, status=status.HTTP_403_FORBIDDEN
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_company(request):
    user = UserCache.get_user(username=request.user.username)
    user_groups = get_groups_tuple(user)
    if GroupName.SUPERADMIN_GROUP in user_groups:
        serializer = CompanySerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        company = serializer.save()
        CompanyCache.set_company(company)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response(
            {"error": ERROR_PERMISSION_DENIED}, status=status.HTTP_403_FORBIDDEN
        )


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def company(request, company_slug):
    user = UserCache.get_user(username=request.user.username)
    user_groups = get_groups_tuple(user)
    # checking if company slug and id from the user belong to same company or not
    is_url_valid = is_slugId_ofSameInstance(company_slug, user, user_groups)

    if not is_url_valid:
        # raise exception error and catch 404 error in server and render 404 page
        return Response({"error": ERROR_INVALID_URL}, status=status.HTTP_404_NOT_FOUND)

    company = CompanyCache.get_company(company_slug)
    if request.method == "GET":
        serializer = CompanySerializer(company, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    if GroupName.SUPERADMIN_GROUP in user_groups:
        if request.method == "PATCH":
            serializer = CompanySerializer(
                company, data=request.data, partial=True, context={"request": request}
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            CompanyCache.delete_company(company.id)
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == "DELETE":
            try:
                company.delete()
                CompanyCache.delete_company(company.id)
            except ProtectedError as e:
                related_objects = e.protected_objects
                # send list of projected objects
                error_message = error_protected_delete_message(
                    company, len(related_objects)
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


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def company_profile(request, company_slug):
    user = UserCache.get_user(username=request.user.username)
    user_groups = get_groups_tuple(user)

    is_url_valid = is_slugId_ofSameInstance(company_slug, user, user_groups)
    if not is_url_valid:
        return Response({"error": ERROR_INVALID_URL}, status=status.HTTP_404_NOT_FOUND)

    if any(
        group_name in user_groups
        for group_name in (
            GroupName.COMPANY_SUPERADMIN_GROUP,
            GroupName.SUPERADMIN_GROUP,
        )
    ):
        company_profile = CompanyCache.get_company_profile(company_slug)

        if request.method == "GET":
            serializer = CompanyProfileSerializer(
                company_profile, context={"request": request}
            )
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == "PATCH":
            serializer = CompanyProfileSerializer(
                company_profile,
                data=request.data,
                partial=True,
                context={"request": request},
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            CompanyCache.delete_company_profile(company_profile)
            return Response(serializer.data, status=status.HTTP_200_OK)

    else:
        return Response(
            {"error": ERROR_PERMISSION_DENIED}, status=status.HTTP_403_FORBIDDEN
        )


@api_view(["POST"])
def company_change_email(request, company_slug):
    user = UserCache.get_user(username=request.user.username)
    user_groups = get_groups_tuple(user)

    is_url_valid = is_slugId_ofSameInstance(company_slug, user, user_groups)
    if not is_url_valid:
        # raise exception error and catch 404 error in server and render 404 page
        return Response({"error": ERROR_INVALID_URL}, status=status.HTTP_404_NOT_FOUND)

    company = CompanyCache.get_company(company_slug)
    new_email = request.data.get("new_email")

    try:
        validate_email(new_email)
    except ValidationError:
        return Response(
            {"error": "Invalid Email address"}, status=status.HTTP_404_NOT_FOUND
        )
    if new_email == company.email:
        return Response(
            {"error": "Email address is already associated with your account"},
            status=status.HTTP_404_NOT_FOUND,
        )

    company_profile = company.profile
    company_profile.email_change_to = new_email
    company_profile.save(update_fields=["email_change_to"])

    # calling celery task to send email
    # sending_update_email.delay(requested_user.id, user_profile.first_name)

    return Response(
        {
            "message": f"Thanks! we've sent you an email containing further instructions for changing your Email Address."
        },
        status=status.HTTP_200_OK,
    )
