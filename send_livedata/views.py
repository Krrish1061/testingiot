from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import status
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from users.auth import ApiKeyAuthentication
from .models import SendLiveDataList
from .serializers import SendLiveDataListSerializer

# Create your views here.
User = get_user_model()


# @login_required
@api_view(["GET", "POST", "PATCH", "DELETE"])
@authentication_classes([ApiKeyAuthentication])
# @permission_classes([IsAuthenticated])
def send_livedata(request, id=None):
    if User.objects.filter(pk=request.user.id, groups__name="super_admin").exists():
        if request.method == "POST":
            serializer = SendLiveDataListSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        elif request.method == "GET":
            obj_list = SendLiveDataList.objects.all()
            serializer = SendLiveDataListSerializer(obj_list, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            try:
                obj = SendLiveDataList.objects.get(pk=id)
            except ObjectDoesNotExist:
                return Response(
                    {"error": "Required Object does not exists"},
                    status=status.HTTP_404_NOT_FOUND,
                )
            if request.method == "PATCH":
                serializer = SendLiveDataList(obj, data=request.data, partial=True)
                serializer.is_valid(raise_exception=True)
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)

            elif request.method == "DELETE":
                obj.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)

    else:
        return Response(
            {"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN
        )
