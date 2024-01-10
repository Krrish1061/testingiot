from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from .utilis import activation_token_for_email, activation_token_for_password_reset
from django.contrib.auth import get_user_model

User = get_user_model()

# implement the url in one place so that i don't need to change it in multiple place


@shared_task
def sending_verify_email(user_id: int):
    """Celery Task to Send verify email to user"""
    # get the user
    user = User.objects.get(pk=user_id)

    # generating the one time token for the user
    confirmation_token = activation_token_for_email.make_token(user)

    # encoding the username
    username = urlsafe_base64_encode(force_bytes(user.username))

    # generating the html message
    html_message = render_to_string(
        "email/email_verify.html",
        {
            "verification_url": f"http://127.0.0.1:5173/verify-email/{username}/{confirmation_token}",
        },
    )

    # message in plain text
    plain_message = strip_tags(html_message)

    send_mail(
        "Email Verification-ThoploMachine",
        plain_message,
        settings.EMAIL_HOST_USER,
        [user.email],
        html_message=html_message,
        fail_silently=False,
    )


@shared_task
def sending_confirmation_email(user_id: int):
    """Celery Task to Send confirmation email to user"""
    # get the user
    user = User.objects.get(pk=user_id)

    # generating the one time token for the user
    confirmation_token = activation_token_for_email.make_token(user)

    # encoding the username
    username = urlsafe_base64_encode(force_bytes(user.username))

    # generating the html message
    html_message = render_to_string(
        "email/set_account_password_email.html",
        {
            "verification_url": f"http://127.0.0.1:5173/set-password/{username}/{confirmation_token}",
        },
    )

    # message in plain text
    plain_message = strip_tags(html_message)

    send_mail(
        "Email Confirmation-ThoploMachine",
        plain_message,
        settings.EMAIL_HOST_USER,
        [user.email],
        html_message=html_message,
        fail_silently=False,
    )


@shared_task
def sending_password_reset_email(email: str):
    """Celery Task to send password reset email to user"""
    # get the user
    try:
        user = User.objects.get(email=email)

        # generating the one time token for the user
        confirmation_token = activation_token_for_password_reset.make_token(user)

        # encoding the username
        username = urlsafe_base64_encode(force_bytes(user.username))

        first_name = user.profile.first_name if user.profile.first_name else None

        # generating the html message
        html_message = render_to_string(
            "email/password_reset_email.html",
            {
                "first_name": first_name,
                "password_reset_url": f"http://127.0.0.1:5173/password-reset/{username}/{confirmation_token}",
            },
        )

        # message in plain text
        plain_message = strip_tags(html_message)

        send_mail(
            "Password Reset Email-Thoplo Machine",
            plain_message,
            settings.EMAIL_HOST_USER,
            [user.email],
            html_message=html_message,
            fail_silently=False,
        )

    except Exception:
        pass


@shared_task
def sending_password_reset_confirmation_email(email: str, first_name: str | None):
    """Celery Task to send password reset confirmation email to user"""

    # generating the html message
    html_message = render_to_string(
        "email/password_reset_confirm_email.html",
        {
            "first_name": first_name,
        },
    )

    # message in plain text
    plain_message = strip_tags(html_message)

    send_mail(
        "Password Reset Confirmation Email-Thoplo Machine",
        plain_message,
        settings.EMAIL_HOST_USER,
        [email],
        html_message=html_message,
        fail_silently=False,
    )


@shared_task
def sending_account_is_active_email(email: str):
    """
    Celery Task to send password set confirmation email to user
    This email is send when user set the password for the first time.
    """

    # generating the html message
    html_message = render_to_string(
        "email/account_active_email.html",
        {
            "login_url": f"http://127.0.0.1:5173",
        },
    )

    # message in plain text
    plain_message = strip_tags(html_message)

    send_mail(
        "Your Account is Now Active!-Thoplo Machine",
        plain_message,
        settings.EMAIL_HOST_USER,
        [email],
        html_message=html_message,
        fail_silently=False,
    )


@shared_task
def sending_update_email(user_id: int, first_name: str):
    """Celery Task to Send mail to the user for updating their email"""

    # get the user
    user = User.objects.get(pk=user_id)

    # generating the one time token for the user
    confirmation_token = activation_token_for_email.make_token(user)

    # encoding the username
    username = urlsafe_base64_encode(force_bytes(user.username))

    # generating the html message
    html_message = render_to_string(
        "email/change_email.html",
        {
            "first_name": first_name,
            "verification_url": f"http://127.0.0.1:5173/change-email/{username}/{confirmation_token}",
        },
    )

    # message in plain text
    plain_message = strip_tags(html_message)

    send_mail(
        "Email Address change request-ThoploMachine",
        plain_message,
        settings.EMAIL_HOST_USER,
        [user.email],
        html_message=html_message,
        fail_silently=False,
    )


@shared_task
def sending_confirmation_mail_for_email_update(
    email: str, first_name: str, old_email: str, new_email: str
):
    """Celery Task to send confirmation mail to the user for updating their email"""

    # generating the html message
    html_message = render_to_string(
        "email/change_email_confirmation.html",
        {
            "first_name": first_name,
            "old_email": old_email,
            "new_email": new_email,
        },
    )

    # message in plain text
    plain_message = strip_tags(html_message)

    send_mail(
        "Email Address Update Confirmation Email-Thoplo Machine",
        plain_message,
        settings.EMAIL_HOST_USER,
        [old_email, new_email],
        html_message=html_message,
        fail_silently=False,
    )
