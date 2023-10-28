from datetime import timedelta, datetime
from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.models import Group
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import ProtectedError
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import CustomTokenObtainPairSerializer
from django.core.signing import BadSignature

from caching.cache import Cache
from caching.cache_key import (
    USER_LIST_CACHE_KEY,
    USER_LIST_CACHE_KEY_APP_NAME,
    get_user_profile_cache_key,
)
from utils.constants import GroupName, UserType
from utils.error_message import (
    ERROR_404_USER_NOT_FOUND,
    ERROR_API_KEY_EXISTS,
    ERROR_INVALID_TOKEN,
    ERROR_COMPANY_SUPERADMIN_DELETE_NOT_ALLOWED,
    ERROR_DELETE_NOT_ALLOWED,
    ERROR_DELETE_OTHER_USER,
    ERROR_INCORRECT_USERNAME_PASSWORD,
    ERROR_INVALID_URL,
    ERROR_NO_USER_SPECIFIED_IN_QUERY_PARMAS,
    ERROR_ONLY_ALPHANUMERIC_CHARACTER_ARE_ALLOWED,
    ERROR_OWN_ACCOUNT_DELETE,
    ERROR_PERMISSION_DENIED,
    ERROR_REFRESH_TOKEN_NOT_FOUND,
    ERROR_USER_LIMIT_REACHED,
    ERROR_USERNAME_ALREADY_CHANGED,
    ERROR_USERNAME_VALUE_NOT_PROVIDED,
    error_protected_delete_message,
)

from .models import UserAdditionalField
from .serializers import UserProfileSerializer, UserSerializer

User = get_user_model()


def get_created_user_cachekey(user):
    # cache key generation for the admin user of model UserAdditionalField
    return f"useradditionalfield-{user.id}"


def is_user_limit_reached(user):
    if user.type == UserType.ADMIN:
        # for the users which are associated with the company
        if user.is_associated_with_company:
            user_limit = user.company.user_limit
            user_created_count = User.objects.filter(company=user.company).count()
            if user_created_count >= user_limit:
                return True
        else:
            # for the admin users which are not associated with the company
            user_limit = user.user_extra_field.user_limit
            user_created_count = user.user_extra_field.user_count
            if user_created_count >= user_limit:
                return True
    return False


def create_update_useradditionalfield_instance(user, requested_user):
    # creating UserAdditionalField instance for the newly created user

    # only for admin user which is not associated with the company
    if not user.is_associated_with_company and user.type == UserType.ADMIN:
        UserAdditionalField.objects.create(
            user=user, created_by=requested_user, user_limit=5
        )
    else:
        UserAdditionalField.objects.create(user=user, created_by=requested_user)

    # Updating the UserAdditionalField instance of the requested user for the admin user which is not associated with the company
    if (
        not requested_user.is_associated_with_company
        and requested_user.type == UserType.ADMIN
    ):
        # increase the user count for the admin user
        requested_user.user_extra_field.user_count += 1
        requested_user.user_extra_field.save()


def get_request_user_authentication(requested_user, user):
    # Checking if the requested user is the user themselves or a SUPERADMIN
    if requested_user == user or requested_user.type == UserType.SUPERADMIN:
        return True

    if requested_user.type == UserType.ADMIN:
        # checking user and requested user belong to same company and
        # if not checking user is created by requested admin user or not

        # also check if company superadmin ---- other admin can't view info
        if (
            requested_user.is_associated_with_company
            and requested_user.company == user.company
        ) or (
            not requested_user.is_associated_with_company
            and user.user_extra_field.created_by != requested_user
        ):
            return True

    return False


def check_delete_action(user, requested_user):
    # user that is need to be delete
    # requested user that initiated the delete request
    is_error = False
    error_message = ""

    #  prevent deleting user created by the superuser
    if user.type == UserType.SUPERADMIN:
        error_message = ERROR_DELETE_NOT_ALLOWED
        is_error = True

    elif (
        user.is_associated_with_company
        and user.groups.filter(name=GroupName.COMPANY_SUPERADMIN_GROUP).exists()
    ):
        error_message = ERROR_COMPANY_SUPERADMIN_DELETE_NOT_ALLOWED
        is_error = True

    # prevent deletion of own account by themeselves
    elif user == requested_user:
        error_message = ERROR_OWN_ACCOUNT_DELETE
        is_error = True

    elif requested_user.type == "ADMIN":
        # preventing user to delete other user created by other admin
        # and preventing user belonging to different company
        # if user.type == UserType.ADMIN and :
        #     error_message = "Deletion of other Admin User Account is not allowed"
        #     is_error = True
        if (
            not requested_user.is_associated_with_company
            and user.user_extra_field.created_by != requested_user
        ) or (
            requested_user.is_associated_with_company
            and requested_user.company != user.company
        ):
            error_message = ERROR_DELETE_OTHER_USER
            is_error = True

        # handling of deleting account of admin user by other admin user of the same company

    return (is_error, f"{ERROR_PERMISSION_DENIED} {error_message}")


def check_username(user, username, id=None):
    if (user.username != username) or (id and user.id != id):
        return False
    return True


def get_user_profile(requested_user):
    cache_key = get_user_profile_cache_key(requested_user.username)
    user_profile = Cache.get(cache_key)
    if not user_profile:
        user_profile = requested_user.profile
        Cache.set(cache_key, user_profile)
    return user_profile


def get_user(username):
    user = Cache.get_user_by_username(USER_LIST_CACHE_KEY, username)
    if user is None:
        try:
            user = (
                User.objects.select_related("company", "user_extra_field", "profile")
                .prefetch_related("groups")
                .get(username=username)
            )
            Cache.set_to_list(
                cache_key=USER_LIST_CACHE_KEY,
                app_name=USER_LIST_CACHE_KEY_APP_NAME,
                data=user,
            )
        except ObjectDoesNotExist:
            return None
    return user


# Create your views here.
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_user(request, username):
    requested_user = request.user
    if not check_username(requested_user, username):
        return Response({"error": ERROR_INVALID_URL}, status=status.HTTP_404_NOT_FOUND)

    if User.objects.filter(
        pk=requested_user.id,
        groups__name__in=(GroupName.ADMIN_GROUP, GroupName.SUPERADMIN_GROUP),
    ).exists():
        if is_user_limit_reached(requested_user):
            return Response(ERROR_USER_LIMIT_REACHED, status=status.HTTP_403_FORBIDDEN)

        serializer = UserSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        Cache.set_to_list(
            cache_key=USER_LIST_CACHE_KEY,
            app_name=USER_LIST_CACHE_KEY_APP_NAME,
            data=user,
        )
        # Creating model instance of UserAdditionalField for all the user
        create_update_useradditionalfield_instance(user, requested_user)
        if (
            requested_user == UserType.SUPERADMIN
            and user.type == UserType.ADMIN
            and user.is_associated_with_company
        ):
            group = User.objects.filter(
                company=user.company,
                groups__name=GroupName.COMPANY_SUPERADMIN_GROUP,
            ).exists()
            if not group:
                # add the company user to the superadmin group -- only the first admin user of the company created by superadmin user
                company_superadmin_group = Group.objects.get(
                    name=GroupName.COMPANY_SUPERADMIN_GROUP
                )
                user.groups.add(company_superadmin_group)

        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response(ERROR_PERMISSION_DENIED, status=status.HTTP_403_FORBIDDEN)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_list_all(request, username):
    requested_user = request.user
    if not check_username(requested_user, username):
        return Response({"error": ERROR_INVALID_URL}, status=status.HTTP_404_NOT_FOUND)
    if User.objects.filter(
        pk=requested_user.id,
        groups__name__in=(GroupName.ADMIN_GROUP, GroupName.SUPERADMIN_GROUP),
    ).exists():
        users = Cache.get_all(
            cache_key=USER_LIST_CACHE_KEY, app_name=USER_LIST_CACHE_KEY_APP_NAME
        )
        if users is None:
            # list of all the users in the application
            users = (
                User.objects.select_related("company", "user_extra_field", "profile")
                .prefetch_related("groups")
                .all()
            )
            Cache.set_all(
                cache_key=USER_LIST_CACHE_KEY,
                app_name=USER_LIST_CACHE_KEY_APP_NAME,
                data=users,
            )

        if requested_user.type == UserType.ADMIN:
            if requested_user.is_associated_with_company:
                # list of the user associated with the specific company
                users = (
                    user for user in users if user.company == requested_user.company
                )
            else:
                # list of the user created by the admin user which is not associated with the company
                cache_key = get_created_user_cachekey(requested_user)
                users_created_list = Cache.get(cache_key)
                if users_created_list is None:
                    users_created_list = (
                        requested_user.created_user_list.all()
                    )  # gives user associated useradditionalfield model instance
                    Cache.set(cache_key, users_created_list)

                users = (
                    user
                    for user in users
                    if user.type != UserType.SUPERADMIN
                    and user.user_extra_field in users_created_list
                )

        serializer = UserSerializer(users, context={"request": request}, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        return Response(ERROR_PERMISSION_DENIED, status=status.HTTP_403_FORBIDDEN)


@csrf_protect
@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def user(request, username, id):
    requested_user = request.user
    if not check_username(requested_user, username, id):
        return Response({"error": ERROR_INVALID_URL}, status=status.HTTP_404_NOT_FOUND)

    # user is the user object excepted to be return in response
    user_username = request.query_params.get("user")

    user = get_user(user_username) if user_username else get_user(username)

    if user is None:
        return Response(
            {"error": ERROR_404_USER_NOT_FOUND}, status=status.HTTP_404_NOT_FOUND
        )

    if request.method == "GET":
        if not get_request_user_authentication(requested_user, user):
            return Response(
                {"error": ERROR_PERMISSION_DENIED},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = UserSerializer(user, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    if User.objects.filter(
        pk=requested_user.id,
        groups__name__in=(GroupName.ADMIN_GROUP, GroupName.SUPERADMIN_GROUP),
    ).exists():
        print("in view", request.data)
        if request.method == "PATCH":
            serializer = UserSerializer(
                user, data=request.data, context={"request": request}, partial=True
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            print("serializer data", serializer.data)
            Cache.delete_from_list(
                USER_LIST_CACHE_KEY, app_name=USER_LIST_CACHE_KEY_APP_NAME, id=user.id
            )
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == "DELETE":
            is_error, error_message = check_delete_action(user, requested_user)
            if is_error:
                return Response(
                    {"error": error_message}, status=status.HTTP_403_FORBIDDEN
                )
            try:
                user.delete()
                Cache.delete_from_list(
                    USER_LIST_CACHE_KEY,
                    app_name=USER_LIST_CACHE_KEY_APP_NAME,
                    id=user.id,
                )
            except ProtectedError as e:
                related_objects = e.protected_objects
                # send list of projected objects
                protected_error_message = error_protected_delete_message(
                    user, len(related_objects)
                )
                return Response(
                    {"error": f"{ERROR_PERMISSION_DENIED} {protected_error_message}"},
                    status=status.HTTP_403_FORBIDDEN,
                )
            return Response(status=status.HTTP_204_NO_CONTENT)

    else:
        return Response(
            {"error": ERROR_PERMISSION_DENIED}, status=status.HTTP_403_FORBIDDEN
        )


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def user_profile(request, username):
    requested_user = request.user
    if not check_username(requested_user, username):
        return Response({"error": ERROR_INVALID_URL}, status=status.HTTP_404_NOT_FOUND)

    user_profile = get_user_profile(requested_user)

    if request.method == "GET":
        serializer = UserProfileSerializer(user_profile)
        return Response(serializer.data, status=status.HTTP_200_OK)
    if request.method == "PATCH":
        serializer = UserProfileSerializer(
            user_profile, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        Cache.delete(get_user_profile_cache_key(username))
        return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["POST", "GET"])
@permission_classes([IsAuthenticated])
def generate_api_key(request, username):
    # make sure api key are generated for the admin user created by the superadmin only
    # change the implementation if need after modifying user fetching queryset/ managers
    requested_user = request.user
    if not check_username(requested_user, username):
        return Response({"error": ERROR_INVALID_URL}, status=status.HTTP_404_NOT_FOUND)
    if User.objects.filter(
        pk=requested_user.id,
        groups__name=GroupName.SUPERADMIN_GROUP,
    ).exists():
        if request.method == "POST":
            api_key = requested_user.api_key if requested_user.api_key else ""
            if api_key:
                return Response(
                    {"error": f"{ERROR_PERMISSION_DENIED} {ERROR_API_KEY_EXISTS}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            while User.objects.filter(api_key=api_key).exists() or api_key == "":
                api_key = generate_api_key()
            requested_user.api_key = api_key
            requested_user.save(update_fields=["api_key"])
            Cache.delete_from_list(USER_LIST_CACHE_KEY, requested_user.id)
            return Response({"api_key": api_key}, status=status.HTTP_200_OK)
        elif request.method == "GET":
            required_username = request.query_params.get("user")
            if not required_username:
                return Response(
                    {"error": ERROR_NO_USER_SPECIFIED_IN_QUERY_PARMAS},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                api_key = User.objects.get(username=required_username).api_key
            except User.DoesNotExist:
                return Response(
                    {"error": ERROR_404_USER_NOT_FOUND},
                    status=status.HTTP_404_NOT_FOUND,
                )

            return Response({"api_key": api_key}, status=status.HTTP_200_OK)

    else:
        return Response(
            {"error": ERROR_PERMISSION_DENIED}, status=status.HTTP_403_FORBIDDEN
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_username(request, username):
    # change the name of the username of the username
    requested_user = request.user
    if not check_username(requested_user, username):
        return Response({"error": ERROR_INVALID_URL}, status=status.HTTP_404_NOT_FOUND)

    user_profile = get_user_profile(requested_user)
    if user_profile.is_username_modified:
        return Response(
            {"error": f"{ERROR_PERMISSION_DENIED} {ERROR_USERNAME_ALREADY_CHANGED}"},
            status=status.HTTP_403_FORBIDDEN,
        )

    username = request.data.get("username")
    if not username:
        return Response(
            {"error": ERROR_USERNAME_VALUE_NOT_PROVIDED},
            status=status.HTTP_400_BAD_REQUEST,
        )
    # this check is unnecessary as it is implemented in model
    if not username.isalnum():
        return Response(
            {"error": ERROR_ONLY_ALPHANUMERIC_CHARACTER_ARE_ALLOWED},
            status=status.HTTP_400_BAD_REQUEST,
        )
    requested_user.username = username
    requested_user.save(update_fields=["username"])
    Cache.delete_from_list(USER_LIST_CACHE_KEY, requested_user.id)
    serializer = UserSerializer(user, context={"request": request})
    return Response(serializer.data, status=status.HTTP_200_OK)


def get_tokens_for_user(user):
    refresh = CustomTokenObtainPairSerializer.get_token(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


@ensure_csrf_cookie
@api_view(["POST"])
@csrf_protect
def login_user(request):
    # handle the error(not implemented) gracefully logging user is not required
    username_or_email = request.data.get("username")
    password = request.data.get("password")
    user = authenticate(request, username=username_or_email, password=password)

    if user:
        serializer = UserSerializer(user)
        token = get_tokens_for_user(user)
        response = Response(status=status.HTTP_200_OK)

        response.data = {
            "user": serializer.data,
            "access": token.get("access"),
        }

        response.set_signed_cookie(
            key=settings.SIMPLE_JWT["AUTH_COOKIE"],
            value=token.get("refresh"),
            domain=settings.SIMPLE_JWT["AUTH_COOKIE_DOMAIN"],
            expires=(datetime.now() + settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"]),
            secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
            httponly=settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
            samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
        )

        return response

    # token handling
    else:
        # find user based on email if exist return password doesnot match else username doesnot exist.
        return Response(
            ERROR_INCORRECT_USERNAME_PASSWORD,
            status=status.HTTP_401_UNAUTHORIZED,
        )


@csrf_protect
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_user(request, username):
    requested_user = request.user
    if not check_username(requested_user, username):
        return Response({"error": ERROR_INVALID_URL}, status=status.HTTP_404_NOT_FOUND)

    try:
        refresh_token = request.get_signed_cookie("refresh_token")
        token = RefreshToken(refresh_token)
        token.blacklist()
    except:
        pass
    response = Response("logout sucessfully", status=status.HTTP_200_OK)
    response.delete_cookie(
        settings.SIMPLE_JWT["AUTH_COOKIE"],
        domain=settings.SIMPLE_JWT["AUTH_COOKIE_DOMAIN"],
        path=settings.SIMPLE_JWT["AUTH_COOKIE_PATH"],
    )
    return response


# implement Rate Limiting
@api_view(["POST"])
@csrf_protect
def cookie_token_refresh(request):
    try:
        refresh_token = request.get_signed_cookie("refresh_token")
    except KeyError:
        return Response(
            {"error": ERROR_REFRESH_TOKEN_NOT_FOUND},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    except BadSignature:
        return Response(
            {"error": ERROR_INVALID_TOKEN},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    serializer = TokenRefreshSerializer(data={"refresh": refresh_token})
    try:
        serializer.is_valid(raise_exception=True)
    except TokenError as e:
        raise InvalidToken(e.args[0])
    return Response(serializer.validated_data, status=status.HTTP_200_OK)


@api_view(["GET"])
@ensure_csrf_cookie
def get_csrf_token(request):
    return Response({"csrfToken": get_token(request)})


@api_view(["GET"])
def autheticate_me(request):
    try:
        refresh_token = request.get_signed_cookie("refresh_token")
        refresh_token_obj = RefreshToken(refresh_token)
    except KeyError:
        return Response(
            {"error": ERROR_REFRESH_TOKEN_NOT_FOUND},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    except (BadSignature, TokenError):
        return Response(
            {"error": ERROR_INVALID_TOKEN}, status=status.HTTP_401_UNAUTHORIZED
        )
    # other method to validate refresh token
    # verify_token_response = TokenBackend(algorithm="HS256").decode(
    #     refresh_token, verify=False
    # )
    # UntypedToken(refresh_token)

    user_id = refresh_token_obj.payload.get("user_id")
    username = refresh_token_obj.payload.get("username")
    user = get_user(username)
    # causes error if usrname is changed
    if (user is None) or (user.username != username):
        return Response(
            {"error": ERROR_INVALID_TOKEN}, status=status.HTTP_401_UNAUTHORIZED
        )

    serializer = UserSerializer(user, context={"request": request})
    return Response(serializer.data, status=status.HTTP_200_OK)
