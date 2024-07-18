from django.db.models import ProtectedError
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from dealer.cache import DealerCache
from dealer.serializers import DealerProfileSerializer, DealerSerializer
from users.cache import UserCache
from utils.commom_functions import get_groups_tuple
from utils.constants import GroupName
from utils.error_message import ERROR_PERMISSION_DENIED, error_protected_delete_message


# Create your views here.
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dealer_list_all(request):
    user = UserCache.get_user(username=request.user.username)
    user_groups = get_groups_tuple(user)
    if GroupName.SUPERADMIN_GROUP in user_groups:
        dealers = DealerCache.get_all_dealer()
        serializer = DealerSerializer(dealers, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        return Response(
            {"error": ERROR_PERMISSION_DENIED}, status=status.HTTP_403_FORBIDDEN
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_dealer(request):
    user = UserCache.get_user(username=request.user.username)
    user_groups = get_groups_tuple(user)
    if GroupName.SUPERADMIN_GROUP in user_groups:
        serializer = DealerSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            dealer = serializer.save()
            DealerCache.set_dealer(dealer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response(
            {"error": ERROR_PERMISSION_DENIED}, status=status.HTTP_403_FORBIDDEN
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_dealer_by_user(request, username):
    user = UserCache.get_user(username=request.user.username)
    user_groups = get_groups_tuple(user)
    if user.username == username and GroupName.DEALER_GROUP in user_groups:
        dealers = DealerCache.get_dealer_by_user(username)
        serializer = DealerSerializer(dealers, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        return Response(
            {"error": ERROR_PERMISSION_DENIED}, status=status.HTTP_403_FORBIDDEN
        )


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def dealer(request, dealer_slug):
    user = UserCache.get_user(username=request.user.username)
    user_groups = get_groups_tuple(user)

    if any(
        group_name in user_groups
        for group_name in (
            GroupName.DEALER_GROUP,
            GroupName.SUPERADMIN_GROUP,
        )
    ):

        dealer = DealerCache.get_dealer(dealer_slug)
        if dealer is None:
            return Response(
                {"error": "Dealer Does not Exist"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if request.method == "GET":
            serializer = DealerSerializer(dealer, context={"request": request})
            return Response(serializer.data, status=status.HTTP_200_OK)

        if GroupName.SUPERADMIN_GROUP in user_groups:
            if request.method == "PATCH":
                serializer = DealerSerializer(
                    dealer,
                    data=request.data,
                    partial=True,
                    context={"request": request},
                )
                serializer.is_valid(raise_exception=True)
                serializer.save()
                DealerCache.delete_dealer(dealer.id)
                return Response(serializer.data, status=status.HTTP_200_OK)

            elif request.method == "DELETE":
                # while deleting the dealers models delete the user instance which is handled via signals
                try:
                    id = dealer.id
                    user_id = dealer.user.id if dealer.user else None
                    with transaction.atomic():
                        if dealer.user:
                            dealer.user.delete()
                        dealer.delete()
                    DealerCache.delete_dealer(id)
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
def dealer_profile(request, dealer_slug):
    user = UserCache.get_user(username=request.user.username)
    user_groups = get_groups_tuple(user)

    if any(
        group_name in user_groups
        for group_name in (
            GroupName.DEALER_GROUP,
            GroupName.SUPERADMIN_GROUP,
        )
    ):
        dealer_profile = DealerCache.get_dealer_profile(dealer_slug)

        if request.method == "GET":
            serializer = DealerProfileSerializer(
                dealer_profile, context={"request": request}
            )
            return Response(serializer.data, status=status.HTTP_200_OK)
        elif request.method == "PATCH":
            serializer = DealerProfileSerializer(
                dealer_profile,
                data=request.data,
                partial=True,
                context={"request": request},
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            DealerCache.delete_dealer_profile(dealer_profile)
            return Response(serializer.data, status=status.HTTP_200_OK)

    else:
        return Response(
            {"error": ERROR_PERMISSION_DENIED}, status=status.HTTP_403_FORBIDDEN
        )
