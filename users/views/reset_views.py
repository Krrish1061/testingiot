from django.utils import timezone
from django.utils.http import urlsafe_base64_decode
from django.views.decorators.csrf import csrf_protect
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from users.cache import UserCache
from users.serializers import UserPasswordSerializer
from users.tasks import (
    sending_password_reset_confirmation_email,
    sending_password_reset_email,
)
from users.utilis import activation_token_for_email
from utils.commom_functions import get_groups_tuple
from utils.constants import GroupName


@csrf_protect
@api_view(["POST"])
def password_reset(request):
    """Handle the password reset request."""
    email = request.data.get("email")
    if not email:
        return Response(
            {"error": "No email address provided"}, status=status.HTTP_400_BAD_REQUEST
        )

    sending_password_reset_email.delay(email)

    return Response(
        {
            "message": f"Thanks! If {email} matches an email we have on file, then we've sent you an email containing further instructions for resetting your password."
        },
        status=status.HTTP_200_OK,
    )


@csrf_protect
@api_view(["POST"])
def password_reset_confirm(request, username, token):
    """
    Reset the password and sends the confirmation Email to the user
    """
    try:
        username = urlsafe_base64_decode(username).decode("utf-8")
    except (TypeError, ValueError, OverflowError, UnicodeDecodeError):
        username = None

    user = UserCache.get_user(username)

    if not activation_token_for_email.check_token(user, token):
        return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)

    serializer = UserPasswordSerializer(data=request.data)
    if serializer.is_valid():
        user.set_password(serializer.validated_data.get("password"))
        user.invalidate_jwt_token_upto = timezone.now()
        user.save()
        # send password reset confirmation email.
        first_name = user.profile.first_name if user.profile.first_name else None

        user_groups = get_groups_tuple(user)
        if any(
            group_name in user_groups
            for group_name in (
                GroupName.COMPANY_SUPERADMIN_GROUP,
                GroupName.DEALER_GROUP,
            )
        ):
            first_name = None

        sending_password_reset_confirmation_email.delay(user.email, first_name)

        return Response(
            {"message": "Password Reset successful"},
            status=status.HTTP_200_OK,
        )

    error_messages = [str(error[0]) for error in serializer.errors.values()]
    return Response({"errors": error_messages}, status=status.HTTP_400_BAD_REQUEST)
