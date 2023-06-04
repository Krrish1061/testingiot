from django.shortcuts import render
from django.contrib.auth import login, logout, authenticate
from rest_framework.decorators import (
    permission_classes,
    api_view,
    authentication_classes,
)
from django.contrib.auth.decorators import login_required
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import UserSerializer
from .auth import ApiKeyAuthentication
from django.db import connection
from .models import AdminUserExtraField, AdminUser, Company
from django.contrib.auth import get_user_model

User = get_user_model()


# Create your views here.
@api_view(["POST"])
# @login_required
# @permission_classes([IsAuthenticated])
@authentication_classes([ApiKeyAuthentication])
def create_user(request):
    requested_user = request.user
    if User.objects.filter(
        pk=requested_user.id, groups__name__in=["admin", "super_admin"]
    ).exists():
        if requested_user.type == "ADMIN":
            user_limit = requested_user.company.user_limit
            user_number = User.objects.filter(company=requested_user.company).count()
            if user_number >= user_limit:
                return Response(
                    f"User limit reached for the {requested_user.company.name.upper()}",
                    status=status.HTTP_403_FORBIDDEN,
                )
        serializer = UserSerializer(data=request.POST, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        if user.type == "ADMIN":
            company_name = request.data.get("company_name")
            create_partition = request.data.get("create_partition")
            if not create_partition:
                create_partition = False
            admin_extra_field = AdminUserExtraField.objects.create(
                admin_user=user,
                company_name=company_name,
                create_partition=create_partition,
            )
            if (
                requested_user.type == "SUPERADMIN"
                and admin_extra_field.create_partition
            ):
                # only creates if admin user is created by superadmin and create_partition is True
                with connection.cursor() as cursor:
                    cursor.execute(
                        f"ALTER TABLE sensor_data_sensordata REORGANIZE PARTITION p_max INTO (PARTITION p_{company_name} VALUES IN ({admin_extra_field.admin_user.pk}), PARTITION p_max VALUES IN (10000));"
                    )
                    cursor.execute(
                        f"ALTER TABLE sensor_data_sensordata REBUILD PARTITION p_{company_name};"
                    )
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response("Permissison denied", status=status.HTTP_403_FORBIDDEN)


@api_view(["POST"])
def login_user(request):
    if request.method == "POST":
        email = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=email, password=password)
        if user:
            login(request, user)
            return Response(user, status=status.HTTP_200_OK)
    return Response("unsupported Method", status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def logout_user(request):
    logout(request)
    return Response("logout sucessfully", status=status.HTTP_200_OK)
