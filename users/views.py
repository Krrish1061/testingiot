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
from rest_framework_simplejwt.tokens import RefreshToken
from .auth import ApiKeyAuthentication
from .serializers import UserSerializer, UserProfileSerializer
from django.core.exceptions import ObjectDoesNotExist
from .models import UserAdditionalField, UserProfile
from django.db.models import ProtectedError


User = get_user_model()


# Create your views here.
@api_view(["POST", "GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
# @authentication_classes([ApiKeyAuthentication])
def user(request, id=None):
    requested_user = request.user
    if request.method == "POST":
        if User.objects.filter(
            pk=requested_user.id, groups__name__in=["admin", "super_admin"]
        ).exists():
            if requested_user.type == "ADMIN":
                if requested_user.is_associated_with_company:
                    user_limit = requested_user.company.user_limit
                    user_number = User.objects.filter(
                        company=requested_user.company
                    ).count()
                    if user_number >= user_limit:
                        return Response(
                            f"User limit reached for the {requested_user.company.name.upper()}",
                            status=status.HTTP_403_FORBIDDEN,
                        )
                else:
                    user_limit = requested_user.user_extra_field.user_limit
                    user_number = requested_user.user_extra_field.user_count
                    if user_number >= user_limit:
                        return Response(
                            f"User limit reached for the {requested_user.profile.first_name.upper()} {requested_user.profile.last_name.upper()}",
                            status=status.HTTP_403_FORBIDDEN,
                        )

            serializer = UserSerializer(data=request.data, context={"request": request})
            serializer.is_valid(raise_exception=True)
            print(serializer.errors)
            user = serializer.save()

            # Creating model instance of UserAdditionalField for all the user
            if not user.is_associated_with_company and user.type == "ADMIN":
                UserAdditionalField.objects.create(
                    user=user, created_by=requested_user, user_limit=5
                )
            else:
                UserAdditionalField.objects.create(user=user, created_by=requested_user)

            if (
                not requested_user.is_associated_with_company
                and requested_user.type == "ADMIN"
            ):
                requested_user.user_extra_field.user_count += 1
                requested_user.user_extra_field.save()

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response("Permissison denied", status=status.HTTP_403_FORBIDDEN)

    elif request.method == "GET":
        # only same company and user created by the admin user can see the user info --- handle it
        try:
            user = User.objects.get(pk=id)
        except ObjectDoesNotExist:
            return Response(
                {"error": f"User does not exists"}, status=status.HTTP_404_NOT_FOUND
            )
        if user.type == "SUPERADMIN" and requested_user.type != "SUPERADMIN":
            return Response(
                {"error": f"Permission denied!!"},
                status=status.HTTP_403_FORBIDDEN,
            )

        if requested_user != user and requested_user.type != "SUPERADMIN":
            if requested_user.type == "ADMIN":
                if (
                    requested_user.is_associated_with_company
                    and requested_user.company != user.company
                ):
                    return Response(
                        {"error": f"Permission denied!!"},
                        status=status.HTTP_403_FORBIDDEN,
                    )

                if (
                    not requested_user.is_associated_with_company
                    and user.user_extra_field.created_by != requested_user
                ):
                    return Response(
                        {"error": f"Permission denied!!"},
                        status=status.HTTP_403_FORBIDDEN,
                    )
            elif requested_user.type == "VIEWER" or requested_user.type == "MODERATOR":
                if requested_user != user:
                    return Response(
                        {"error": f"Permission denied!!"},
                        status=status.HTTP_403_FORBIDDEN,
                    )

        serializer = UserSerializer(user, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == "DELETE":
        if User.objects.filter(
            pk=requested_user.id, groups__name__in=["admin", "super_admin"]
        ).exists():
            try:
                user = User.objects.get(pk=id)
            except ObjectDoesNotExist:
                return Response(
                    {"error": f"User does not exists"}, status=status.HTTP_404_NOT_FOUND
                )
            #  prevent deleting user created by the superuser
            if (
                user.user_extra_field.created_by.type == "SUPERADMIN"
                and requested_user.type != "SUPERADMIN"
            ):
                return Response(
                    {"error": f"Permission denied!"},
                    status=status.HTTP_403_FORBIDDEN,
                )

            if requested_user.type == "ADMIN":
                if not requested_user.is_associated_with_company:
                    #  preventing user to delete other user created by other admin
                    if user.user_extra_field.created_by != requested_user:
                        return Response(
                            {"error": f"Permission denied"},
                            status=status.HTTP_403_FORBIDDEN,
                        )

                else:
                    if user.user_extra_field.created_by.type == "SUPERADMIN":
                        return Response(
                            {
                                "error": f"Permission denied! Deletion of the account is Prohibited!!"
                            },
                            status=status.HTTP_403_FORBIDDEN,
                        )
                    if requested_user.company != user.company:
                        return Response(
                            {
                                "error": f"Permission denied! Deletion of the other user account of different Organization is Prohibited!!"
                            },
                            status=status.HTTP_403_FORBIDDEN,
                        )
            try:
                user.delete()

            except ProtectedError as e:
                related_objects = e.protected_objects
                # send list of projected objects
                error_message = f'Cannot delete "{user}". It is referenced by {len(related_objects)} other objects.'
                return Response(
                    {"error": error_message},
                    status=status.HTTP_404_NOT_FOUND,
                )
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response(
                {"error": f"Permission denied"}, status=status.HTTP_403_FORBIDDEN
            )

    elif request.method == "PATCH":
        if User.objects.filter(
            pk=requested_user.id, groups__name__in=["admin", "super_admin"]
        ).exists():
            try:
                user = User.objects.get(pk=id)
            except ObjectDoesNotExist:
                return Response(
                    {"error": f"User does not exists"}, status=status.HTTP_404_NOT_FOUND
                )
            serializer = UserSerializer(
                user, data=request.data, context={"request": request}, partial=True
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        else:
            return Response(
                {"error": f"Permission denied"}, status=status.HTTP_403_FORBIDDEN
            )


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
# @authentication_classes([ApiKeyAuthentication])
def user_profile(request, id):
    requested_user = request.user
    try:
        user_profile = UserProfile.objects.get(pk=id)
    except ObjectDoesNotExist:
        return Response(
            {"error": f"UserProfile does not exists"}, status=status.HTTP_404_NOT_FOUND
        )

    if requested_user != user_profile.user:
        return Response(
            {
                "error": f"Permission denided! Changing User profile of another user is Prohibited"
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    if request.method == "GET":
        serializer = UserProfileSerializer(user_profile)
        return Response(serializer.data, status=status.HTTP_200_OK)
    if request.method == "PATCH":
        serializer = UserProfileSerializer(
            user_profile, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["POST"])
def login_user(request):
    if request.method == "POST":
        # handle the error(not implemented) gracefully logging user is not required
        email = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(request, username=email, password=password)
        if user:
            # login(request, user)
            serializer = UserSerializer(user)
            refresh = RefreshToken.for_user(user)
            response = {
                "user": serializer.data,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }
            # print(user.groups.values_list("name", flat=True))
            return Response(response, status=status.HTTP_200_OK)

        # token handling
        else:
            #  find user based on email if exist return password doesnot match else username doesnot exist.
            return Response(
                "Username or password does not match",
                status=status.HTTP_400_BAD_REQUEST,
            )
    return Response("unsupported Method", status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def logout_user(request):
    logout(request)
    return Response("logout sucessfully", status=status.HTTP_200_OK)


# # @login_required
# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# # @authentication_classes([ApiKeyAuthentication])
# def user_view(request, id):
#     try:
#         user = User.objects.select_related("company").get(pk=id)
#     except ObjectDoesNotExist:
#         return Response(
#             {"error": f"User does not exists"}, status=status.HTTP_404_NOT_FOUND
#         )

#     if request.method == "GET":
#         if user.company != request.user.company:
#             return Response(
#                 {
#                     "error": f"Requested User is not associated with the {(request.user.company.name).upper()} company. Permission Denied!!"
#                 },
#                 status=status.HTTP_403_FORBIDDEN,
#             )
#         serializer = UserSerializer(user)
#         return Response(serializer.data, status=status.HTTP_200_OK)
