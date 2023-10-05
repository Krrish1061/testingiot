class UserType:
    """
    Constants representing different user types in the system.

    - SUPERADMIN: Super administrators with full access.
    - ADMIN: Administrators with administrative privileges.
    - MODERATOR: Moderators with moderation capabilities.
    - VIEWER: Regular viewers with limited access.

    Usage:
    You can use these constants to check and assign user types in the application.

    Example:
    if user_type == UserType.SUPERADMIN:
        # Perform actions for Superadmins
    elif user_type == UserType.ADMIN:
        # Perform actions for Admins
    elif user_type == UserType.MODERATOR:
        # Perform actions for Moderators
    elif user_type == UserType.VIEWER:
        # Perform actions for Viewers
    """

    SUPERADMIN = "SUPERADMIN"
    ADMIN = "ADMIN"
    MODERATOR = "MODERATOR"
    VIEWER = "VIEWER"


class GroupName:
    """
    Constants for group names in the application.

    These constants represent the names of different user groups within the application.

    Attributes:
        SUPERADMIN_GROUP (str): The name of the SuperAdmin Group.
        ADMIN_GROUP (str): The name of the Admin Group.
        MODERATOR_GROUP (str): The name of the Moderator Group.
        VIEWER_GROUP (str): The name of the Viewer Group.
        COMPANY_SUPERADMIN_GROUP (str): The name of the Company Superadmin Group.
    """

    SUPERADMIN_GROUP = "super_admin"
    ADMIN_GROUP = "admin"
    MODERATOR_GROUP = "moderator"
    VIEWER_GROUP = "viewer"
    COMPANY_SUPERADMIN_GROUP = "company_super_admin"
