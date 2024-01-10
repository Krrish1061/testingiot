from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
from django.core.validators import RegexValidator
from company.models import Company
from utils.error_message import (
    ERROR_IS_ASSOCIATION_WITH_COMPANY_FALSE,
    ERROR_IS_ASSOCIATION_WITH_COMPANY_TRUE,
    ERROR_NO_UNIQUE_USERNAME,
    ERROR_PHONE_NUMBER,
)

from .managers import AdminManager, ModeratorManager, UserManager, ViewerManager
from .validators import alphanumeric_validator, validate_file_size


# Create your models here.
class User(AbstractBaseUser, PermissionsMixin):
    """
    User model representing users in the system.

    The model provides fields for basic user information, such as
    first name, last name, email etc.

    Fields:
        company (Company): The company associated with the user.
            If not associated with any company, this field will be blank and set to null.

        is_associated_with_company (bool): A boolean flag indicating if the user is associated
            with a company. If True, the 'company' field must be present.

        email (str): The email address of the user. Must be unique.

        is_staff (bool): A boolean flag indicating if the user is a staff member with admin
            access to the Django admin interface.

        is_active (bool): A boolean flag indicating if the user account is active.

        date_joined (datetime): The date and time when the user account was created.

        api_key (str): The authentication API key for the user, if applicable.

        type (str): The user type, chosen from the UserTypes enumeration. Defaults to 'VIEWER'.
            UserTypes (Enum): An enumeration representing the possible user types.
                - SUPERADMIN: Represents a superadmin user with the highest privileges.
                - ADMIN: Represents an admin user with administrative privileges.
                - MODERATOR: Represents a moderator user with specific moderation privileges.
                - VIEWER: Represents a viewer user with viewer privileges.
            base_type (str): The default user type for new users. Set to 'VIEWER' by default.

    """

    class UserTypes(models.TextChoices):
        SUPERADMIN = "SUPERADMIN", "superadmin"
        ADMIN = "ADMIN", "admin"
        MODERATOR = "MODERATOR", "moderator"
        VIEWER = "VIEWER", "viewer"

    base_type = UserTypes.VIEWER

    company = models.ForeignKey(
        Company,
        on_delete=models.PROTECT,
        related_name="company_users",
        blank=True,
        null=True,
    )

    email = models.EmailField(verbose_name="email address", max_length=255, unique=True)
    is_email_verified = models.BooleanField(default=False, blank=True)
    username = models.CharField(
        verbose_name="Username",
        max_length=20,
        unique=True,
        blank=True,
        null=True,
        help_text="Required. 20 characters or fewer. Letters and digits only.",
        validators=[alphanumeric_validator],
        error_messages={"unique": ERROR_NO_UNIQUE_USERNAME},
    )
    is_associated_with_company = models.BooleanField(default=False, blank=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now, editable=False)
    api_key = models.CharField(
        verbose_name="Authentication Api key",
        max_length=32,
        unique=True,
        null=True,
        blank=True,
    )

    type = models.CharField(
        verbose_name="User type",
        max_length=20,
        choices=UserTypes.choices,
        default=base_type,
        blank=True,
        null=False,
    )
    created_by = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        related_name="user_created_by",
        blank=True,
        null=True,
    )
    user_limit = models.PositiveSmallIntegerField(blank=True, null=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        """Returns the string representation of the User model"""
        return self.username

    class Meta:
        indexes = [
            models.Index(fields=["email"]),
            models.Index(fields=["username"]),
            models.Index(fields=["api_key"]),
        ]

    def clean(self):
        if self.company and not self.is_associated_with_company:
            raise ValidationError(ERROR_IS_ASSOCIATION_WITH_COMPANY_FALSE)
        if not self.company and self.is_associated_with_company:
            raise ValidationError(ERROR_IS_ASSOCIATION_WITH_COMPANY_TRUE)

    def save(self, *args, **kwargs):
        if self.company:
            self.is_associated_with_company = True
        else:
            self.is_associated_with_company = False
        super().save(*args, **kwargs)


# Defining the proxy model for Admin usertypes
class AdminUser(User):
    """
    Proxy model representing an Admin User.

    This model extends the base User model to represent users with administrative
    privileges. It inherits all fields and behavior from the User model but sets
    user type to 'ADMIN'.

    base_type (str): The base user type of this model. It is set to 'ADMIN'.
    objects (AdminManager): Custom manager to retrieve AdminUser instances.

    Note: AdminUser is a proxy model, meaning it shares the same database table
          and fields with the User model. It does not create a separate table.

    """

    base_type = User.UserTypes.ADMIN
    objects = AdminManager()

    class Meta:
        proxy = True


# Defining the proxy model for Moderator usertypes
class ModeratorUser(User):

    """
    Proxy model representing an Moderator User.

    This model extends the base User model to represent users with Moderator
    privileges. It inherits all fields and behavior from the User model but sets
    user type to 'Moderator'.

    base_type (str): The base user type of this model. It is set to 'MODERATOR'.
    objects (ModeratorManager): Custom manager to retrieve ModeratorUser instances.

    Note: ModeratorUser is a proxy model, meaning it shares the same database table
          and fields with the User model. It does not create a separate table.

    """

    base_type = User.UserTypes.MODERATOR
    objects = ModeratorManager()

    class Meta:
        proxy = True


# defining the proxy model for viewer usertypes
class ViewerUser(User):

    """
    Proxy model representing an Viewer User.

    This model extends the base User model to represent users with Viewer
    privileges. It inherits all fields and behavior from the User model but sets
    user type to 'viewer'.

    base_type (str): The base user type of this model. It is set to 'VIEWER'.
    objects (ViewerManager): Custom manager to retrieve ViewerUser instances.

    Note: ViewerUser is a proxy model, meaning it shares the same database table
          and fields with the User model. It does not create a separate table.

    """

    base_type = User.UserTypes.VIEWER
    objects = ViewerManager()

    class Meta:
        proxy = True


#  change name of the class
# class UserAdditionalField(models.Model):
#     """
#     Model to define user extra field.

#     This model represents a one-to-one relationship with the User model, allowing
#     to define extra field for user. Each user can be associated
#     with their user creation limit, a count of how many users they have created.

#     Fields:
#         user (User): The user associated with this creation limit.
#         created_by (User): The user who created the user define in user field.
#                            Can be null if created automatically or not applicable.
#         limit (int): The maximum number of users the associated user can create.
#                      Default value is 5.
#         count (int): The current count of users created by the associated user.
#                      Default value is 0.
#     """

#     # change related name field
#     user = models.OneToOneField(
#         User,
#         on_delete=models.CASCADE,
#         related_name="user_extra_field",
#         null=True,
#         blank=True,
#     )
#     created_by = models.ForeignKey(
#         User,
#         #  change to do nothing so that error does not occur when admin user is deleted
#         on_delete=models.SET_NULL,
#         related_name="created_user_list",
#         blank=True,
#         null=True,
#     )
#     user_limit = models.PositiveSmallIntegerField(default=0)
#     user_count = models.PositiveSmallIntegerField(default=0)

#     def __str__(self):
#         """Returns the string representation of the model"""
#         return f"UserAdditionalField of {self.user}"


class UserProfile(models.Model):
    """
    User profile model representing extended information about users in the system.

    Fields:
        user (User): The user associated with this profile. It has a one-to-one relationship with the User model.

        profile_picture (ImageField): The profile picture of the user.

        first_name (str): A first name of the user.

        last_name (str): A last name of the user.

        facebook_profile (str): URL to the user's Facebook profile.

        linkedin_profile (str): URL to the user's LinkedIn profile.

        phone_number (str): The user's contact phone number.

        date_of_birth (date): The user's date of birth.

        # Add other fields as needed
    """

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    first_name = models.CharField("first name", max_length=150, blank=True)
    last_name = models.CharField("last name", max_length=150, blank=True)
    # generates thumbnail and use that thumbnail
    profile_picture = models.ImageField(
        upload_to="users/profile_pictures/",
        validators=[validate_file_size],
        blank=True,
        null=True,
    )
    facebook_profile = models.URLField(blank=True, null=True)
    linkedin_profile = models.URLField(blank=True, null=True)
    phone_number = models.CharField(
        max_length=10,
        validators=[
            RegexValidator(
                regex=r"^[0-9]{10}$",
                message=ERROR_PHONE_NUMBER,
            ),
        ],
        blank=True,
        null=True,
    )
    date_of_birth = models.DateField(blank=True, null=True)
    address = models.CharField(max_length=500, blank=True, null=True)
    is_username_modified = models.BooleanField(default=False, blank=True)
    email_change_to = models.EmailField(
        verbose_name="email address", max_length=255, null=True, blank=True
    )
    # Add other fields as needed

    def __str__(self):
        """Returns the string representation of the UserProfile model."""
        return f"Profile of {self.user.username}"
