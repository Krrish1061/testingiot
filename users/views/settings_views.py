from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.utils import timezone
from django.utils.http import urlsafe_base64_decode
from django.views.decorators.csrf import csrf_protect
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from company.cache import CompanyCache
from dealer.cache import DealerCache
from users.cache import UserCache
from users.serializers import ChangePasswordSerializer, UserPasswordSerializer
from users.tasks import (
    sending_account_is_active_email,
    sending_confirmation_email,
    sending_confirmation_mail_for_email_update,
    sending_update_email,
    sending_verify_email,
)
from users.utilis import activation_token_for_email, check_username
from utils.commom_functions import generate_api_key, get_groups_tuple
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

    requested_user = UserCache.get_user(request.user)

    if GroupName.SUPERADMIN_GROUP in get_groups_tuple(requested_user):
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
    user = UserCache.get_user(new_username)
    if user:
        return Response(
            {
                "error": f"'{new_username}' username already exist, Please choose another Username"
            },
            status=status.HTTP_400_BAD_REQUEST,
        )
    # updating username field
    requested_user.username = new_username
    requested_user.invalidate_jwt_token_upto = timezone.now()
    requested_user.save(update_fields=["username", "invalidate_jwt_token_upto"])
    # modifing user profile
    user_profile.is_username_modified = True
    user_profile.save(update_fields=["is_username_modified"])
    UserCache.clear()

    return Response(
        {"message": "username sucessfully changed"}, status=status.HTTP_200_OK
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
        user.invalidate_jwt_token_upto = timezone.now()
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
        sending_confirmation_email.delay(user.username)
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
            {"error": "Password is already set for your account"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not activation_token_for_email.check_token(user, token):
        return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)

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
@permission_classes([IsAuthenticated])
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

    users = UserCache.get_all_users()
    if any(new_email == user.email for user in users):
        return Response(
            {
                "error": "This email already exist in our system. Please! use another email"
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    user_profile = UserCache.get_profile(username)
    user_profile.email_change_to = new_email
    user_profile.save(update_fields=["email_change_to"])
    UserCache.delete_user(user.id)

    # calling celery task to send email
    sending_update_email.delay(user.username)

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
    user_groups = get_groups_tuple(user)

    if activation_token_for_email.check_token(user, token):
        old_email = user.email
        user.email = user.profile.email_change_to
        user.save(update_fields=["email"])

        # sending email for verying that email was changed sucessfully
        first_name = user.profile.first_name if user else None
        if GroupName.COMPANY_SUPERADMIN_GROUP in user_groups:
            first_name = None
            company = user.company
            company.email = user.profile.email_change_to
            company.save(update_fields=["email"])

        elif GroupName.DEALER_GROUP in user_groups:
            first_name = None
            dealer = user.dealer
            dealer.email = user.profile.email_change_to
            dealer.save(update_fields=["email"])

        sending_confirmation_mail_for_email_update.delay(
            first_name=first_name,
            old_email=old_email,
            new_email=user.profile.email_change_to,
        )
        UserCache.delete_user(user.id)
        return Response(
            {"message": "Email verification successful"}, status=status.HTTP_200_OK
        )
    return Response(
        {"error": "Email verification failed - Invalid Verification Token"},
        status=status.HTTP_400_BAD_REQUEST,
    )


def get_target_user(user, company, dealer):
    if user:
        return UserCache.get_user(user)
    elif dealer:
        dealer_obj = DealerCache.get_dealer(dealer)
        return dealer_obj.user if dealer_obj else None
    elif company:
        company_obj = CompanyCache.get_company(company)
        return company_obj.user if company_obj else None
    return None


@csrf_protect
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def resend_confirmation_email(request):
    requested_user = UserCache.get_user(request.user.username)
    user_groups = get_groups_tuple(requested_user)

    if GroupName.SUPERADMIN_GROUP in user_groups:
        user = request.data.get("user")
        company = request.data.get("company")
        dealer = request.data.get("dealer")

        if not any([user, company, dealer]):
            return Response(
                {
                    "error": "You must provide either a user, company, or dealer identifier."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        send_email_to_user = get_target_user(user, company, dealer)

        if send_email_to_user is None:
            return Response(
                {"error": "Unknown user/company/dealer provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if (
            send_email_to_user.is_active
            or send_email_to_user.is_email_verified
            or send_email_to_user.last_login is not None
        ):
            return Response(
                {"error": "This account email has already been verified"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        sending_verify_email.delay(send_email_to_user.username)

        return Response(
            {"message": "Email is send successfully"}, status=status.HTTP_200_OK
        )

    else:
        return Response(
            {"error": ERROR_PERMISSION_DENIED}, status=status.HTTP_403_FORBIDDEN
        )


@csrf_protect
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def resend_set_password_email(request):
    requested_user = UserCache.get_user(request.user.username)
    user_groups = get_groups_tuple(requested_user)

    if GroupName.SUPERADMIN_GROUP in user_groups:
        user = request.data.get("user")
        company = request.data.get("company")
        dealer = request.data.get("dealer")

        if not any([user, company, dealer]):
            return Response(
                {
                    "error": "You must provide either a user, company, or dealer identifier."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        send_email_to_user = get_target_user(user, company, dealer)

        if send_email_to_user is None:
            return Response(
                {"error": "Unknown user/company/dealer provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if send_email_to_user.is_active or send_email_to_user.last_login is not None:
            return Response(
                {"error": "This account password has already been set."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        sending_confirmation_email.delay(send_email_to_user.username)

        return Response("Email is send successfully", status=status.HTTP_200_OK)

    else:
        return Response(
            {"error": ERROR_PERMISSION_DENIED}, status=status.HTTP_403_FORBIDDEN
        )
