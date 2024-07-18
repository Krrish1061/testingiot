from django.db import transaction
from django.db.models import ProtectedError
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from company.cache import CompanyCache
from company.models import Company
from dealer.cache import DealerCache
from users.cache import UserCache
from utils.commom_functions import generate_api_key, get_groups_tuple
from utils.constants import GroupName
from utils.error_message import (
    ERROR_API_KEY_EXISTS,
    ERROR_COMPANY_NOT_FOUND,
    ERROR_INVALID_URL,
    ERROR_PERMISSION_DENIED,
)

from .serializers import CompanyProfileSerializer, CompanySerializer
from .utils import is_slugId_ofSameInstance


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
    elif GroupName.DEALER_GROUP in user_groups:
        dealer_companies = CompanyCache.dealer_associated_company(user.dealer)
        serializer = CompanySerializer(
            dealer_companies, many=True, context={"request": request}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        return Response(
            {"error": ERROR_PERMISSION_DENIED}, status=status.HTTP_403_FORBIDDEN
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_company(request):
    requested_user = UserCache.get_user(username=request.user.username)
    user_groups = get_groups_tuple(requested_user)
    if any(
        group_name in user_groups
        for group_name in (GroupName.DEALER_GROUP, GroupName.SUPERADMIN_GROUP)
    ):
        if GroupName.DEALER_GROUP in user_groups:
            dealer = DealerCache.get_dealer_by_user(requested_user)
            company_limit = dealer.user_company_limit if dealer else 0
            company_count = Company.objects.filter(dealer=requested_user.dealer).count()
            users = UserCache.get_all_users()
            user_created_count = len(
                [
                    user
                    for user in users
                    if user.dealer == requested_user.dealer
                    and user.id != requested_user.id
                ]
            )
            company_created_count = user_created_count + company_count

            if company_created_count >= company_limit:
                return Response(
                    {"error": f"{ERROR_PERMISSION_DENIED} Company limit reached"},
                    status=status.HTTP_403_FORBIDDEN,
                )
        serializer = CompanySerializer(
            data=request.data,
            context={
                "request": request,
                "user_groups": user_groups,
                "dealer": requested_user.dealer,
            },
        )
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
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

    company = CompanyCache.get_company(company_slug)
    if company is None:
        return Response(
            {"error": "Company Does not Exist"},
            status=status.HTTP_404_NOT_FOUND,
        )

    if request.method == "GET":
        # checking if company slug and id from the user belong to same company or not
        is_url_valid = is_slugId_ofSameInstance(company_slug, user, user_groups)

        if not is_url_valid:
            return Response(
                {"error": ERROR_PERMISSION_DENIED}, status=status.HTTP_403_FORBIDDEN
            )

        serializer = CompanySerializer(company, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    if any(
        group_name in user_groups
        for group_name in (GroupName.DEALER_GROUP, GroupName.SUPERADMIN_GROUP)
    ):
        if request.method == "PATCH":
            if GroupName.SUPERADMIN_GROUP in user_groups:
                serializer = CompanySerializer(
                    company,
                    data=request.data,
                    partial=True,
                    context={"request": request},
                )
                serializer.is_valid(raise_exception=True)
                serializer.save()
                CompanyCache.delete_company(company.id)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(
                    {"error": ERROR_PERMISSION_DENIED}, status=status.HTTP_403_FORBIDDEN
                )

        elif request.method == "DELETE":
            if GroupName.DEALER_GROUP in user_groups:
                if user.dealer != company.dealer:
                    return Response(
                        {"error": ERROR_PERMISSION_DENIED},
                        status=status.HTTP_403_FORBIDDEN,
                    )

            try:
                id = company.id
                user_id = company.user.id if company.user else None
                with transaction.atomic():
                    if company.user:
                        company.user.delete()
                    company.delete()
                CompanyCache.delete_company(id)
                if user_id:
                    UserCache.delete_user(user_id)
            except ProtectedError as e:
                related_objects_details = {
                    obj._meta.verbose_name for obj in e.protected_objects
                }
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


# @csrf_protect
@api_view(["POST", "GET"])
@permission_classes([IsAuthenticated])
def generate_company_api_key(request):
    user = UserCache.get_user(username=request.user.username)
    user_groups = get_groups_tuple(user)
    if GroupName.SUPERADMIN_GROUP in user_groups:
        company_slug = request.query_params.get("company")
        if not company_slug:
            return Response(
                {"error": "No company provided in query params"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        company = CompanyCache.get_company(company_slug)

        if request.method == "POST":
            api_key = company.api_key if company.api_key else ""
            if api_key:
                return Response(
                    {"error": f"{ERROR_PERMISSION_DENIED} {ERROR_API_KEY_EXISTS}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            while Company.objects.filter(api_key=api_key).exists() or api_key == "":
                api_key = generate_api_key()
            company.api_key = api_key
            company.save(update_fields=["api_key"])
            return Response({"api_key": api_key}, status=status.HTTP_200_OK)
        elif request.method == "GET":
            try:
                api_key = Company.objects.get(slug=company_slug).api_key
            except Company.DoesNotExist:
                return Response(
                    {"error": ERROR_COMPANY_NOT_FOUND},
                    status=status.HTTP_404_NOT_FOUND,
                )

            return Response({"api_key": api_key}, status=status.HTTP_200_OK)

    else:
        return Response(
            {"error": ERROR_PERMISSION_DENIED}, status=status.HTTP_403_FORBIDDEN
        )
