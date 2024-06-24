from users.managers import (
    AdminManager,
    CompanySuperAdminUserManager,
    DealerUserManager,
    ModeratorManager,
    ViewerManager,
)

from .user_models import User


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


# defining the proxy model for Dealer Admin User
class DealerUser(User):
    """
    Proxy model representing an Dealer User.

    This model extends the base User model to represent the dealer Users. It inherits all fields and behavior from the User model but sets
    user type to 'admin'.

    base_type (str): The base user type of this model. It is set to 'ADMIN'.
    objects (DealerUserManager): Custom manager to retrieve Dealer User instances.

    Note: DealerUser is a proxy model, meaning it shares the same database table
          and fields with the User model. It does not create a separate table.

    """

    base_type = User.UserTypes.ADMIN
    objects = DealerUserManager()

    class Meta:
        proxy = True


# defining the proxy model for viewer usertypes
class CompanySuperAdminUser(User):
    """
    Proxy model representing an Company SuperAdmin User.

    This model extends the base User model to represent the Company SuperAdmin Users. It inherits all fields and behavior from the User model but sets
    user type to 'admin'.

    base_type (str): The base user type of this model. It is set to 'ADMIN'.
    objects (CompanySuperAdminUserManager): Custom manager to retrieve Company SuperAdmin User instances.

    Note: CompanySuperAdminUser is a proxy model, meaning it shares the same database table
          and fields with the User model. It does not create a separate table.

    """

    base_type = User.UserTypes.ADMIN
    objects = CompanySuperAdminUserManager()

    class Meta:
        proxy = True
