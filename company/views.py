from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import ProtectedError
from rest_framework import status
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from users.auth import ApiKeyAuthentication
from .models import Company
from .serializers import CompanySerializer, CompanyProfileSerializer


# Create your views here.
User = get_user_model()


# @login_required
@api_view(["POST", "GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
# @authentication_classes([ApiKeyAuthentication])
def company(request, company_slug=None, id=None):
    #  check if company slug and slig from the id-object is same or not
    if User.objects.filter(pk=request.user.id, groups__name="super_admin").exists():
        if request.method == "POST":
            serializer = CompanySerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        elif request.method == "GET":
            if not id:
                company = Company.objects.all()
                serializer = CompanySerializer(company, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)

            try:
                company = Company.objects.get(pk=id)
            except ObjectDoesNotExist:
                return Response(
                    {"error": "Company does not exists"},
                    status=status.HTTP_404_NOT_FOUND,
                )
            serializer = CompanySerializer(company)
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == "PATCH":
            try:
                company = Company.objects.get(pk=id)
            except ObjectDoesNotExist:
                return Response(
                    {"error": "Company does not exists"},
                    status=status.HTTP_404_NOT_FOUND,
                )
            serializer = CompanySerializer(company, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == "DELETE":
            try:
                company = Company.objects.get(pk=id)
            except ObjectDoesNotExist:
                return Response(
                    {"error": "Company does not exists"},
                    status=status.HTTP_404_NOT_FOUND,
                )
            try:
                company.delete()
            except ProtectedError as e:
                related_objects = e.protected_objects
                # send list of projected objects
                error_message = f'Cannot delete "{company}". It is referenced by {len(related_objects)} other objects.'
                return Response(
                    {"error": error_message},
                    status=status.HTTP_404_NOT_FOUND,
                )

            return Response(status=status.HTTP_204_NO_CONTENT)

    else:
        return Response(
            {"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN
        )


# @login_required
@api_view(["GET", "PATCH"])
# @authentication_classes([ApiKeyAuthentication])
@permission_classes([IsAuthenticated])
def company_profile(request, id):
    try:
        company = Company.objects.select_related("company_profile").get(pk=id)
        company_profile = company.company_profile
    except ObjectDoesNotExist:
        return Response(
            {"error": "Company does not exists"},
            status=status.HTTP_404_NOT_FOUND,
        )

    if request.user in company.company_users.all():
        if request.method == "GET":
            serializer = CompanyProfileSerializer(company_profile)
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == "PATCH":
            if request.user.type in ("ADMIN", "SUPERADMIN"):
                serializer = CompanyProfileSerializer(
                    company_profile, data=request.data, partial=True
                )
                serializer.is_valid(raise_exception=True)
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(
                    {"error": "Permission denied"}, status=status.HTTP_401_UNAUTHORIZED
                )

    else:
        return Response(
            {"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN
        )
