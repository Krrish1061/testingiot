from django.contrib.auth import get_user_model
from django.db.models import ProtectedError
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from caching.cache import Cache
from caching.cache_key import (
    COMPANY_LIST_CACHE_KEY,
    COMPANY_LIST_CACHE_KEY_APP_NAME,
    get_company_profile_cache_key,
)
from utils.constants import GroupName, UserType
from utils.error_message import (
    ERROR_INVALID_URL,
    ERROR_PERMISSION_DENIED,
    error_protected_delete_message,
)

from .models import Company
from .serializers import CompanyProfileSerializer, CompanySerializer
from .utils import is_slugId_ofSameInstance

User = get_user_model()


def get_company_profile(company):
    cache_key = get_company_profile_cache_key(company.slug)
    company_profile = Cache.get(cache_key)
    if company_profile:
        return company_profile
    else:
        company_profile = company.profile
        Cache.set(cache_key, company_profile)
        return company_profile


def is_user_authorized(user, company_id):
    """Checks to see if user is authorized for GET request response"""
    if user.type == UserType.SUPERADMIN:
        return True
    if user.is_associated_with_company and user.company.id == company_id:
        return True
    return False


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def company_list_all(request):
    if User.objects.filter(
        pk=request.user.id, groups__name=GroupName.SUPERADMIN_GROUP
    ).exists():
        companies = Cache.get_all(
            cache_key=COMPANY_LIST_CACHE_KEY, app_name=COMPANY_LIST_CACHE_KEY_APP_NAME
        )
        if companies is None:
            companies = Company.objects.all()
            Cache.set_all(
                cache_key=COMPANY_LIST_CACHE_KEY,
                app_name=COMPANY_LIST_CACHE_KEY_APP_NAME,
                data=companies,
            )

        serializer = CompanySerializer(companies, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        return Response(
            {"error": ERROR_PERMISSION_DENIED}, status=status.HTTP_403_FORBIDDEN
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_company(request):
    if User.objects.filter(
        pk=request.user.id, groups__name=GroupName.SUPERADMIN_GROUP
    ).exists():
        serializer = CompanySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        company = serializer.save()
        Cache.set_to_list(
            cache_key=COMPANY_LIST_CACHE_KEY,
            app_name=COMPANY_LIST_CACHE_KEY_APP_NAME,
            data=company,
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def company(request, id, company_slug):
    # checking if company slug and id from the id-object is same or not
    is_url_valid, company = is_slugId_ofSameInstance(company_slug, id)
    if not is_url_valid:
        # raise exception error and catch 404 error in server and render 404 page
        return Response({"error": ERROR_INVALID_URL}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        if not is_user_authorized(request.user, company.id):
            return Response(
                {"error": ERROR_PERMISSION_DENIED}, status=status.HTTP_403_FORBIDDEN
            )
        serializer = CompanySerializer(company)
        return Response(serializer.data, status=status.HTTP_200_OK)

    if User.objects.filter(
        pk=request.user.id, groups__name=GroupName.SUPERADMIN_GROUP
    ).exists():
        if request.method == "PATCH":
            serializer = CompanySerializer(company, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            Cache.delete_from_list(COMPANY_LIST_CACHE_KEY, company.id)
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == "DELETE":
            try:
                company.delete()
                Cache.delete_from_list(COMPANY_LIST_CACHE_KEY, company.id)
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
def company_profile(request, company_slug, id):
    is_url_valid, company = is_slugId_ofSameInstance(company_slug, id)
    if not is_url_valid:
        return Response({"error": ERROR_INVALID_URL}, status=status.HTTP_404_NOT_FOUND)

    if is_user_authorized(request.user, company.id):
        company_profile = get_company_profile(company)

        if request.method == "GET":
            serializer = CompanyProfileSerializer(company_profile)
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == "PATCH":
            if request.user.type in (UserType.ADMIN, UserType.SUPERADMIN):
                serializer = CompanyProfileSerializer(
                    company_profile, data=request.data, partial=True
                )
                serializer.is_valid(raise_exception=True)
                serializer.save()
                Cache.delete(get_company_profile_cache_key(company.slug))
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(
                    {"error": ERROR_PERMISSION_DENIED},
                    status=status.HTTP_403_FORBIDDEN,
                )

    else:
        return Response(
            {"error": ERROR_PERMISSION_DENIED}, status=status.HTTP_403_FORBIDDEN
        )
