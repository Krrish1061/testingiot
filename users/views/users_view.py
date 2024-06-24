from django.contrib.auth import get_user_model
from django.db.models import ProtectedError
from django.views.decorators.csrf import csrf_protect
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from company.cache import CompanyCache
from dealer.cache import DealerCache
from users.cache import UserCache
from users.serializers import UserProfileSerializer, UserSerializer
from users.utilis import check_username
from utils.commom_functions import get_groups_tuple
from utils.constants import GroupName, UserType
from utils.error_message import (
    ERROR_404_USER_NOT_FOUND,
    ERROR_COMPANY_SUPERADMIN_DELETE_NOT_ALLOWED,
    ERROR_DELETE_NOT_ALLOWED,
    ERROR_DELETE_OTHER_USER,
    ERROR_INVALID_URL,
    ERROR_OWN_ACCOUNT_DELETE,
    ERROR_PERMISSION_DENIED,
    ERROR_USER_LIMIT_REACHED,
)

User = get_user_model()


def is_user_limit_reached(user, user_groups):
    """
    Checks if the admin user is allowed to create a new user or not.

    Args:
        user: The user object.
        user_groups: A list of groups the user belongs to.

    Returns:
        bool: True if the user limit is reached, False otherwise.
    """
    # return False for the superAdmin User
    if GroupName.ADMIN_GROUP not in user_groups:
        return False

    user_limit = 0
    user_created_count = 0

    if GroupName.DEALER_GROUP in user_groups:
        dealer = DealerCache.get_dealer_by_user(user)
        user_limit = dealer.user_company_limit if dealer else 0
        # 1 is substracted to exclude user in dealer group (i.e user created when creating dealer )
        user_count = User.objects.filter(dealer=user.dealer).count() - 1
        companies = CompanyCache.get_all_company()
        company_created_count = len(
            [company for company in companies if company.dealer == user.dealer]
        )
        user_created_count = user_count + company_created_count

    elif user.is_associated_with_company:
        user_limit = user.company.user_limit
        user_created_count = User.objects.filter(company=user.company).count()
    else:
        # for the admin users which are not associated with the company
        user_limit = user.user_limit
        # one is add as to include admin user(self) that is created by the superadmin/dealer user
        user_created_count = User.objects.filter(created_by=user).count() + 1

    return user_created_count >= user_limit


def check_delete_action(user, requested_user, user_groups):
    """
    Checks the if the requested user is allowed to delete the user
    """
    # user that is need to be delete
    # requested user that initiated the delete request
    is_error = False
    error_message = ""

    #  prevent deleting user created by the superuser
    if user.type == UserType.SUPERADMIN:
        error_message = ERROR_DELETE_NOT_ALLOWED
        is_error = True

    # cannot delete company's super-admin
    elif (
        user.is_associated_with_company
        and GroupName.COMPANY_SUPERADMIN_GROUP in user_groups
    ):
        error_message = ERROR_COMPANY_SUPERADMIN_DELETE_NOT_ALLOWED
        is_error = True

    # prevent deletion of own account by themeselves
    elif user == requested_user:
        error_message = ERROR_OWN_ACCOUNT_DELETE
        is_error = True

    elif GroupName.DEALER_GROUP in user_groups:
        if user.dealer != requested_user.dealer:
            error_message = "You cannot Delete this user."
            is_error = True

    elif GroupName.ADMIN_GROUP in user_groups:
        deleting_user_group = get_groups_tuple(user)
        # preventing deletion of admin and superadmin user by the admin user
        if any(
            group_name in deleting_user_group
            for group_name in (
                GroupName.ADMIN_GROUP,
                GroupName.SUPERADMIN_GROUP,
                GroupName.DEALER_GROUP,
            )
        ):
            error_message = "Cannot Delete the user."
            is_error = True

        # preventing user to delete other user created by other admin
        # and preventing user belonging to different company
        elif (
            not requested_user.is_associated_with_company
            and user.created_by != requested_user
        ) or (
            requested_user.is_associated_with_company
            and requested_user.company != user.company
        ):
            error_message = ERROR_DELETE_OTHER_USER
            is_error = True

    return (is_error, f"{ERROR_PERMISSION_DENIED} {error_message}")


@csrf_protect
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_user(request, username):
    if not check_username(request.user, username):
        return Response({"error": ERROR_INVALID_URL}, status=status.HTTP_404_NOT_FOUND)

    user = UserCache.get_user(username)
    user_groups = get_groups_tuple(user)
    if any(
        group_name in user_groups
        for group_name in (GroupName.ADMIN_GROUP, GroupName.SUPERADMIN_GROUP)
    ):
        if is_user_limit_reached(user, user_groups):
            return Response(
                {"error": f"{ERROR_PERMISSION_DENIED} {ERROR_USER_LIMIT_REACHED}"},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = UserSerializer(
            data=request.data, context={"request": request, "user_groups": user_groups}
        )
        serializer.is_valid(raise_exception=True)
        new_user = serializer.save()

        # create_company_super_admin(new_user, user_groups)
        UserCache.set_user(new_user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response(
            {"error": ERROR_PERMISSION_DENIED}, status=status.HTTP_403_FORBIDDEN
        )


@csrf_protect
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_all_users(request, username):
    if not check_username(request.user, username):
        return Response({"error": ERROR_INVALID_URL}, status=status.HTTP_404_NOT_FOUND)
    requested_user = UserCache.get_user(username=username)
    user_groups = get_groups_tuple(requested_user)
    if any(
        group_name in user_groups
        for group_name in (GroupName.ADMIN_GROUP, GroupName.SUPERADMIN_GROUP)
    ):
        users = UserCache.get_all_users()
        if GroupName.SUPERADMIN_GROUP in user_groups:
            # filtering out the dealer group user and company superadmin group user
            users = (
                user
                for user in users
                if all(
                    group.name != GroupName.DEALER_GROUP
                    and group.name != GroupName.COMPANY_SUPERADMIN_GROUP
                    for group in user.groups.all()
                )
            )
        elif GroupName.DEALER_GROUP in user_groups:
            # user.id != requested_user.id is for to exclude the dealer user.
            # This user is used for internal use only as it is used to gives dealer model to provide login system
            users = (
                user
                for user in users
                if user.dealer == requested_user.dealer and user.id != requested_user.id
            )
        elif GroupName.ADMIN_GROUP in user_groups:
            if requested_user.is_associated_with_company:
                if GroupName.COMPANY_SUPERADMIN_GROUP in user_groups:
                    # list of the user for the company superadmin
                    users = (
                        user
                        for user in users
                        if user.company == requested_user.company
                        and user.id != requested_user.id
                    )
                else:
                    # list of the user for other admin user only moderator and viewer user only
                    users = (
                        user
                        for user in users
                        if user.company == requested_user.company
                        and user.type != UserType.ADMIN
                    )
            else:
                # list of the user created by the admin user which is not associated with the company
                users = (
                    user
                    for user in users
                    if (user.created_by == requested_user or user == requested_user)
                )

        serializer = UserSerializer(users, context={"request": request}, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        return Response(
            {"error": ERROR_PERMISSION_DENIED}, status=status.HTTP_403_FORBIDDEN
        )


@csrf_protect
@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def user(request, username):
    if not check_username(request.user, username):
        return Response({"error": ERROR_INVALID_URL}, status=status.HTTP_404_NOT_FOUND)
    requested_user = UserCache.get_user(username)
    user_groups = get_groups_tuple(requested_user)

    if request.method == "GET":
        serializer = UserSerializer(requested_user, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif any(
        group_name in user_groups
        for group_name in (GroupName.ADMIN_GROUP, GroupName.SUPERADMIN_GROUP)
    ):
        editing_user_username = request.query_params.get("user")

        if not editing_user_username:
            return Response(
                {"error": "No user provided in query params"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = UserCache.get_user(editing_user_username)

        if user is None:
            return Response(
                {"error": ERROR_404_USER_NOT_FOUND}, status=status.HTTP_404_NOT_FOUND
            )

        if request.method == "PATCH":
            serializer = UserSerializer(
                user,
                data=request.data,
                context={"request": request, "user_groups": user_groups},
                partial=True,
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            UserCache.delete_user(user_id=user.id)
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == "DELETE":
            is_error, error_message = check_delete_action(
                user, requested_user, user_groups
            )
            if is_error:
                return Response(
                    {"error": error_message}, status=status.HTTP_403_FORBIDDEN
                )
            try:
                user_id = user.id
                api_key = user.api_key
                user.delete()
                UserCache.delete_user(user_id=user_id, api_key=api_key)
            except ProtectedError as e:
                related_objects_details = [
                    obj._meta.verbose_name for obj in e.protected_objects
                ]

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


@csrf_protect
@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def user_profile(request, username):
    if not check_username(request.user, username):
        return Response({"error": ERROR_INVALID_URL}, status=status.HTTP_404_NOT_FOUND)

    user_profile = UserCache.get_profile(username)

    if request.method == "GET":
        serializer = UserProfileSerializer(user_profile, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    if request.method == "PATCH":
        serializer = UserProfileSerializer(
            user_profile, data=request.data, partial=True, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        UserCache.delete_profile(request.user.id)
        return Response(serializer.data, status=status.HTTP_200_OK)
