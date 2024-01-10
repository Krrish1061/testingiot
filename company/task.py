from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.contrib.auth import get_user_model

User = get_user_model()

# import secrets

# def generate_unique_token():
#     # Generate a 32-character random token
#     return secrets.token_urlsafe(32)


@shared_task
def sending_company_update_email(user_id: int, first_name: str):
    """Celery Task to Send mail to the user for updating their email"""

    # get the user
    user = User.objects.get(pk=user_id)

    # generating the one time token for the user
    confirmation_token = ""
    # activation_token_for_email.make_token(user)

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
