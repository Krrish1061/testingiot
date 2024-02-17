from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from send_livedata.cache import SendLiveDataCache
from users.cache import UserCache
from utils.commom_functions import get_groups_tuple
from utils.constants import GroupName
from utils.error_message import (
    ERROR_404_NOT_FOUND,
    ERROR_DELETE_FAILED,
    ERROR_PERMISSION_DENIED,
)

from .models import SendLiveDataList
from .serializers import SendLiveDataListSerializer

# Create your views here.


# @api_view(["POST"])
# @permission_classes([IsAuthenticated])
# def add_send_livedata(request):
#     user = UserCache.get_user(username=request.user.username)
#     user_groups = get_groups_tuple(user)
#     if GroupName.SUPERADMIN_GROUP in user_groups:
#         serializer = SendLiveDataListSerializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         send_livedata = serializer.save()
#         SendLiveDataCache.set_send_livedata(send_livedata)
#         return Response(serializer.data, status=status.HTTP_201_CREATED)
#     else:
#         return Response(
#             {"error": ERROR_PERMISSION_DENIED}, status=status.HTTP_403_FORBIDDEN
#         )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def send_livedata_list_all(request):
    user = UserCache.get_user(username=request.user.username)
    user_groups = get_groups_tuple(user)
    if GroupName.SUPERADMIN_GROUP in user_groups:
        # might cause problem i.e might not return all the values due to cache
        send_livedata = SendLiveDataCache.get_all_send_livedata()
        serializer = SendLiveDataListSerializer(send_livedata, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        return Response(
            {"error": ERROR_PERMISSION_DENIED}, status=status.HTTP_403_FORBIDDEN
        )


@api_view(["POST", "GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def send_livedata(request):
    user = UserCache.get_user(username=request.user.username)
    user_groups = get_groups_tuple(user)
    if GroupName.SUPERADMIN_GROUP in user_groups:

        if request.method == "POST":
            serializer = SendLiveDataListSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            send_livedata = serializer.save()
            SendLiveDataCache.set_send_livedata(send_livedata)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        company_slug = request.query_params.get("company")
        username = request.query_params.get("user")
        if not company_slug and not username:
            return Response(
                {"error": "No company or User specified"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        send_livedata = (
            SendLiveDataCache.get_send_livedata_by_user(username)
            if username
            else SendLiveDataCache.get_send_livedata_by_company(company_slug)
        )

        if send_livedata is None:
            return Response(
                {"error": ERROR_404_NOT_FOUND}, status=status.HTTP_404_NOT_FOUND
            )

        if request.method == "GET":
            serializer = SendLiveDataListSerializer(send_livedata)
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == "PATCH":
            serializer = SendLiveDataListSerializer(
                send_livedata, data=request.data, partial=True
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            SendLiveDataCache.delete_send_livedata(send_livedata.id)
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == "DELETE":
            try:
                send_livedata.delete()
                SendLiveDataCache.delete_send_livedata(send_livedata.id)
            except:
                return Response(
                    {"error": ERROR_DELETE_FAILED}, status=status.HTTP_403_FORBIDDEN
                )

            return Response(status=status.HTTP_204_NO_CONTENT)

    else:
        return Response(
            {"error": ERROR_PERMISSION_DENIED}, status=status.HTTP_403_FORBIDDEN
        )
