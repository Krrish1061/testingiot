from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from caching.cache import Cache
from caching.cache_key import (
    SEND_LIVE_DATA_LIST_CACHE_KEY,
    SEND_LIVE_DATA_LIST_CACHE_KEY_APP_NAME,
)
from utils.constants import GroupName
from utils.error_message import (
    ERROR_404_NOT_FOUND,
    ERROR_DELETE_FAILED,
    ERROR_PERMISSION_DENIED,
)

from .models import SendLiveDataList
from .serializers import SendLiveDataListSerializer

# Create your views here.
User = get_user_model()


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_send_livedata(request):
    if User.objects.filter(
        pk=request.user.id, groups__name=GroupName.SUPERADMIN_GROUP
    ).exists():
        serializer = SendLiveDataListSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        send_livedata = serializer.save()
        Cache.set_to_list(
            cache_key=SEND_LIVE_DATA_LIST_CACHE_KEY,
            app_name=SEND_LIVE_DATA_LIST_CACHE_KEY_APP_NAME,
            data=send_livedata,
        )
        return Response(serializer.data, status=status.HTTP_201_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def send_livedata_list_all(request):
    if User.objects.filter(
        pk=request.user.id, groups__name=GroupName.SUPERADMIN_GROUP
    ).exists():
        # might cause problem i.e might not return all the values due to cache
        send_livedata = Cache.get_all(
            cache_key=SEND_LIVE_DATA_LIST_CACHE_KEY,
            app_name=SEND_LIVE_DATA_LIST_CACHE_KEY_APP_NAME,
        )
        if send_livedata is None:
            send_livedata = SendLiveDataList.objects.select_related(
                "user", "company"
            ).all()
            Cache.set_all(
                cache_key=SEND_LIVE_DATA_LIST_CACHE_KEY,
                app_name=SEND_LIVE_DATA_LIST_CACHE_KEY_APP_NAME,
                data=send_livedata,
            )

        serializer = SendLiveDataListSerializer(send_livedata, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def send_livedata(request, id):
    if User.objects.filter(
        pk=request.user.id, groups__name=GroupName.SUPERADMIN_GROUP
    ).exists():
        send_livedata = Cache.get_from_list(
            cache_key=SEND_LIVE_DATA_LIST_CACHE_KEY, id=id
        )
        if send_livedata is None:
            try:
                send_livedata = SendLiveDataList.objects.select_related(
                    "user", "company"
                ).get(pk=id)
                Cache.set_to_list(
                    cache_key=SEND_LIVE_DATA_LIST_CACHE_KEY,
                    app_name=SEND_LIVE_DATA_LIST_CACHE_KEY_APP_NAME,
                    data=send_livedata,
                )
            except ObjectDoesNotExist:
                return Response(
                    {"error": ERROR_404_NOT_FOUND},
                    status=status.HTTP_404_NOT_FOUND,
                )

        if request.method == "GET":
            serializer = SendLiveDataListSerializer(send_livedata)
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == "PATCH":
            serializer = SendLiveDataList(
                send_livedata, data=request.data, partial=True
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            Cache.delete_from_list(SEND_LIVE_DATA_LIST_CACHE_KEY, id)
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == "DELETE":
            try:
                send_livedata.delete()
                Cache.delete_from_list(SEND_LIVE_DATA_LIST_CACHE_KEY, id)
            except:
                return Response(
                    {"error": ERROR_DELETE_FAILED},
                    status=status.HTTP_403_FORBIDDEN,
                )

            return Response(status=status.HTTP_204_NO_CONTENT)

    else:
        return Response(
            {"error": ERROR_PERMISSION_DENIED}, status=status.HTTP_403_FORBIDDEN
        )
