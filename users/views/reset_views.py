from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils.http import urlsafe_base64_decode
from users.cache import UserCache
from users.serializers import UserPasswordSerializer
from users.task import (
    sending_password_reset_confirmation_email,
    sending_password_reset_email,
)
from users.utilis import activation_token_for_email
from django.views.decorators.csrf import csrf_protect


@csrf_protect
@api_view(["POST"])
def password_reset(request):
    """Handle the password reset request."""
    email = request.data.get("email")
    if not email:
        return Response(
            {"message": "No email address provided"}, status=status.HTTP_400_BAD_REQUEST
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
    try:
        username = urlsafe_base64_decode(username).decode("utf-8")
    except (TypeError, ValueError, OverflowError, UnicodeDecodeError):
        username = None

    user = UserCache.get_user(username)

    if not activation_token_for_email.check_token(user, token):
        return Response(
            {"message": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST
        )

    serializer = UserPasswordSerializer(data=request.data)
    if serializer.is_valid():
        user.set_password(serializer.validated_data.get("password"))
        user.is_active = True
        user.save()
        # send password reset confirmation email.
        first_name = user.profile.first_name if user.profile.first_name else None
        sending_password_reset_confirmation_email.delay(user.email, first_name)

        return Response(
            {"message": "Password Reset successful"},
            status=status.HTTP_200_OK,
        )

    error_messages = [str(error[0]) for error in serializer.errors.values()]
    return Response({"errors": error_messages}, status=status.HTTP_400_BAD_REQUEST)
