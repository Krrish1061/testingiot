from django.shortcuts import render
from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.decorators import login_required
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import (
    authentication_classes,
    permission_classes,
    api_view,
)
from .serializers import CompanySerializer
from .models import Company
from users.auth import ApiKeyAuthentication

# Create your views here.


User = get_user_model()


@login_required
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_company(request):
    if User.objects.filter(pk=request.user.id, groups__name="super_admin").exists():
        serializer = CompanySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        return Response(
            {"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN
        )


@login_required
@api_view(["POST", "GET", "PATCH"])
@permission_classes([IsAuthenticated])
@authentication_classes([ApiKeyAuthentication])
def company_detail(request, pk):
    requested_user = request.user
    try:
        company = Company.objects.get(pk=pk)
    except ObjectDoesNotExist:
        return Response(
            {"error": "Company does not exists"}, status=status.HTTP_404_NOT_FOUND
        )
    if request.method == "GET":
        serializer = CompanySerializer(company)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == "PATCH":
        if User.objects.filter(
            pk=requested_user.id, groups__name="super_admin"
        ).exists():
            serializer = CompanySerializer(company, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            print(serializer.data)
            return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == "DELETE":
        if User.objects.filter(
            pk=requested_user.id, groups__name="super_admin"
        ).exists():
            company.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
    else:
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
