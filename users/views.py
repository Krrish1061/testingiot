from django.contrib.auth import authenticate, get_user_model, login, logout
from django.contrib.auth.decorators import login_required
from rest_framework import status
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .auth import ApiKeyAuthentication
from .serializers import UserSerializer

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
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response("Permissison denied", status=status.HTTP_403_FORBIDDEN)


@api_view(["POST"])
def login_user(request):
    if request.method == "POST":
        email = request.data["username"]
        print(email)
        password = request.data["password"]
        user = authenticate(request, username=email, password=password)
        if user:
            login(request, user)
            return Response(status=status.HTTP_200_OK)
        else:
            return Response(
                "Username doesnot exists", status=status.HTTP_400_BAD_REQUEST
            )
    return Response("unsupported Method", status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def logout_user(request):
    logout(request)
    return Response("logout sucessfully", status=status.HTTP_200_OK)
