from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from users.cache import UserCache
from django.views.decorators.csrf import csrf_protect
from django.contrib.auth import get_user_model
from users.serializers import ChangePasswordSerializer, UserPasswordSerializer
from users.task import (
    sending_account_is_active_email,
    sending_confirmation_email,
    sending_confirmation_mail_for_email_update,
    sending_update_email,
)
from users.utilis import check_username, generate_api_key
from django.utils.http import urlsafe_base64_decode
from users.utilis import activation_token_for_email
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from utils.commom_functions import get_groups_tuple
from utils.constants import GroupName
from utils.error_message import (
    ERROR_404_USER_NOT_FOUND,
    ERROR_API_KEY_EXISTS,
    ERROR_INVALID_URL,
    ERROR_NO_USER_SPECIFIED_IN_QUERY_PARMAS,
    ERROR_ONLY_ALPHANUMERIC_CHARACTER_ARE_ALLOWED,
    ERROR_PERMISSION_DENIED,
    ERROR_USERNAME_ALREADY_CHANGED,
    ERROR_USERNAME_VALUE_NOT_PROVIDED,
)


User = get_user_model()


@csrf_protect
@api_view(["POST", "GET"])
@permission_classes([IsAuthenticated])
def generate_user_api_key(request, username):
    # make sure api key are generated for the admin user created by the superadmin only
    # change the implementation if need after modifying user fetching queryset/ managers
    # if possible generate api_key for company also that api_key will give data from all the devices associated with company.
    if not check_username(request.user, username):
        return Response({"error": ERROR_INVALID_URL}, status=status.HTTP_404_NOT_FOUND)

    if GroupName.SUPERADMIN_GROUP in get_groups_tuple(request.user):
        required_username = request.query_params.get("user")
        if not required_username:
            return Response(
                {"error": ERROR_NO_USER_SPECIFIED_IN_QUERY_PARMAS},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = UserCache.get_user(required_username)

        if request.method == "POST":
            api_key = user.api_key if user.api_key else ""
            if api_key:
                return Response(
                    {"error": f"{ERROR_PERMISSION_DENIED} {ERROR_API_KEY_EXISTS}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            while User.objects.filter(api_key=api_key).exists() or api_key == "":
                api_key = generate_api_key()
            user.api_key = api_key
            user.save(update_fields=["api_key"])
            return Response({"api_key": api_key}, status=status.HTTP_200_OK)
        elif request.method == "GET":
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


@csrf_protect
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_username(request, username):
    # change the name of the username of the username
    requested_user = request.user
    if not check_username(requested_user, username):
        return Response({"error": ERROR_INVALID_URL}, status=status.HTTP_404_NOT_FOUND)

    user_profile = UserCache.get_profile(username)
    if user_profile.is_username_modified:
        return Response(
            {"error": f"{ERROR_PERMISSION_DENIED} {ERROR_USERNAME_ALREADY_CHANGED}"},
            status=status.HTTP_403_FORBIDDEN,
        )

    new_username = request.data.get("username")
    if not new_username:
        return Response(
            {"error": ERROR_USERNAME_VALUE_NOT_PROVIDED},
            status=status.HTTP_400_BAD_REQUEST,
        )
    # checking for alphanumeric character
    if not new_username.isalnum():
        return Response(
            {"error": ERROR_ONLY_ALPHANUMERIC_CHARACTER_ARE_ALLOWED},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # checking if the username already exists
    if User.objects.get(username=new_username):
        return Response(
            {
                "error": f"'{new_username}' username already exist, Please choose another Username"
            },
            status=status.HTTP_400_BAD_REQUEST,
        )
    old_username = requested_user.username
    # updating username field
    requested_user.username = new_username
    requested_user.save(update_fields=["username"])
    # modifing user profile
    user_profile.is_username_modified = True
    user_profile.save(update_fields=["is_username_modified"])
    # deleting user and user_profile from cache
    UserCache.delete_user(requested_user.id)
    return Response(
        {"message": "Username is successfully changed"}, status=status.HTTP_200_OK
    )


@csrf_protect
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request, username):
    user = request.user
    if not check_username(user, username):
        return Response({"error": ERROR_INVALID_URL}, status=status.HTTP_404_NOT_FOUND)

    serializer = ChangePasswordSerializer(data=request.data, context={"user": user})

    if serializer.is_valid():
        user.set_password(serializer.validated_data.get("new_password"))
        user.save()
        UserCache.delete_user(user.id)
        return Response(
            {"message": "Password changed successfully."}, status=status.HTTP_200_OK
        )

    # check how the error response is send if possible make response like above success response
    error_list = [str(serializer.errors[error][0]) for error in serializer.errors]
    return Response(error_list, status=status.HTTP_400_BAD_REQUEST)


@csrf_protect
@api_view(["POST"])
def verify_email(request, username, token):
    try:
        username = urlsafe_base64_decode(username).decode("utf-8")
    except (TypeError, ValueError, OverflowError, UnicodeDecodeError):
        username = None
    user = UserCache.get_user(username)

    if user and user.is_email_verified:
        return Response(
            {"message": "Email has already been verified."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if activation_token_for_email.check_token(user, token):
        user.is_email_verified = True
        user.save()
        # send email for confirmation and to set your password if they forget
        sending_confirmation_email.delay(user.id)
        UserCache.delete_user(user.id)
        return Response(
            {"message": "Email verification successful"}, status=status.HTTP_200_OK
        )
    return Response(
        {"error": "Email verification failed - Invalid Verification Token"},
        status=status.HTTP_400_BAD_REQUEST,
    )


@csrf_protect
@api_view(["POST"])
def set_user_password(request, username, token):
    try:
        username = urlsafe_base64_decode(username).decode("utf-8")
    except (TypeError, ValueError, OverflowError, UnicodeDecodeError):
        username = None
    user = UserCache.get_user(username)

    # only allow user to set password when lastlogin field is none
    if user and user.last_login is not None:
        return Response(
            {"message": "Password is already set for your account"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not activation_token_for_email.check_token(user, token):
        return Response(
            {"message": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST
        )

    serializer = UserPasswordSerializer(data=request.data)
    if serializer.is_valid():
        user.set_password(serializer.validated_data.get("password"))
        user.is_active = True
        user.save()
        UserCache.delete_user(user.id)
        # can send confirmation email letting them know password has been set
        sending_account_is_active_email.delay(user.email)
        return Response(
            {"message": "Password have been set successfully"},
            status=status.HTTP_200_OK,
        )

    error_messages = [str(error[0]) for error in serializer.errors.values()]
    return Response({"errors": error_messages}, status=status.HTTP_400_BAD_REQUEST)


@csrf_protect
@api_view(["POST"])
def change_email(request, username):
    user = request.user
    if not check_username(user, username):
        return Response({"error": ERROR_INVALID_URL}, status=status.HTTP_404_NOT_FOUND)

    new_email = request.data.get("new_email")

    if new_email == user.email:
        return Response(
            {"error": "Email address is already associated with your account"},
            status=status.HTTP_404_NOT_FOUND,
        )

    try:
        validate_email(new_email)
    except ValidationError:
        return Response(
            {"error": "Invalid Email address"}, status=status.HTTP_404_NOT_FOUND
        )

    user_profile = UserCache.get_profile(username)
    user_profile.email_change_to = new_email
    user_profile.save(update_fields=["email_change_to"])
    UserCache.delete_user(user.id)

    # calling celery task to send email
    sending_update_email.delay(user.id, user_profile.first_name)

    return Response(
        {
            "message": f"Thanks! we've sent you an email containing further instructions for changing your Email Address."
        },
        status=status.HTTP_200_OK,
    )


@csrf_protect
@api_view(["POST"])
def verify_update_email(request, username, token):
    try:
        username = urlsafe_base64_decode(username).decode("utf-8")
    except (TypeError, ValueError, OverflowError, UnicodeDecodeError):
        username = None
    user = UserCache.get_user(username)

    if activation_token_for_email.check_token(user, token):
        old_email = user.email
        user.email = user.profile.email_change_to
        user.save(update_fields=["email"])
        # sending email for verying that email was changed sucessfully
        sending_confirmation_mail_for_email_update.delay(
            user.id, old_email=old_email, new_email=user.profile.email_change_to
        )
        UserCache.delete_user(user.id)
        return Response(
            {"message": "Email verification successful"}, status=status.HTTP_200_OK
        )
    return Response(
        {"error": "Email verification failed - Invalid Verification Token"},
        status=status.HTTP_400_BAD_REQUEST,
    )
