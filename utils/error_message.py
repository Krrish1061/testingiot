#  General ERROR Message
ERROR_PERMISSION_DENIED = "Permission denied!"
ERROR_INVALID_URL = "Invalid URL"
ERROR_API_AUTHENTICATION_FAILED = "API authetication failed"
ERROR_INVALID_API_KEY = "Invalid API key Provided"
ERROR_NO_API_KEY_PROVIDED = "Include API key or unsupported format"
ERROR_404_NOT_FOUND = "Required Object does not exists"
ERROR_DELETE_FAILED = "Specified Object Deletion Failed"
ERROR_PHONE_NUMBER = "Phone number must only contain exactly 10 Numeric digits."
ERROR_REFRESH_TOKEN_NOT_FOUND = "Refresh token not found"
ERROR_INVALID_TOKEN = "Token is invalid or expired"

def error_protected_delete_message(obj, length: int):
    return f"Cannot delete {obj}. It is referenced by {length} other objects."


# company app
ERROR_COMPANY_NOT_FOUND = "Company does not exist."

# iot_device app
ERROR_DEVICE_NOT_FOUND = "Specified Iot Devices does not exists."
ERROR_DEVICE_NO_VALID_ASSOCIATION = (
    "Iot device must be associated with either admin user or the company."
)
ERROR_DEVICE_INACTIVE = "The Iot device is Inactive."
ERROR_DEVICE_NOT_FOUND = "Iot Devices does not exists."

# Users app
ERROR_INCORRECT_USERNAME_PASSWORD = "Username or password does not match"
ERROR_NO_EMAIL = "Users must have an email address"
ERROR_STAFF_USER_SET_FALSE = "Staff user must have is_staff=True"
ERROR_STAFF_USER_SET_IS_SUPERADMIN_TRUE = "Staff user must have is_superuser=False"
ERROR_SUPERADMIN_SET_IS_STAFF_FALSE = "Superuser must have is_staff=True"
ERROR_SUPERADMIN_SET_IS_SUPERUSER_FALSE = "Superuser must have is_superuser=True"
ERROR_INACTIVE_USER = (
    "The User is set to Inactive. Please contact Authorized person for assistance."
)


ERROR_404_USER_NOT_FOUND = "User does not exists."
ERROR_ADMIN_USER_NOT_FOUND = "Admin User does not exist."
ERROR_ONLY_ADMIN_USER_PERMITTED = "Only User of type ADMIN are allowed."
ERROR_ADMIN_USER_ASSOCIATED_WITH_COMPANY = (
    "Admin User cannot be associated with company."
)
ERROR_NO_UNIQUE_USERNAME = "A user with that username already exists."
ERROR_IS_ASSOCIATION_WITH_COMPANY_FALSE = "Field 'is_associated_with_company' must be True when user is associated with company."
ERROR_IS_ASSOCIATION_WITH_COMPANY_TRUE = "Field 'is_associated_with_company' must be False when user is not associated with company."
ERROR_USER_LIMIT_REACHED = "User limit reached"
ERROR_DELETE_NOT_ALLOWED = "This account cannot be deleted!"
ERROR_COMPANY_SUPERADMIN_DELETE_NOT_ALLOWED = (
    "Company superadmin user cannot be deleted!"
)
ERROR_DELETE_OTHER_USER = "Deletinon of User created by the other user is prohibited."
ERROR_OWN_ACCOUNT_DELETE = "You cannot delete your own account."
ERROR_PROFILE_NOT_FOUND = "UserProfile does not exists."
ERROR_UPDATING_OTHER_ADMIN_USER = "Updating other Admin user info is not allowed"
ERROR_UPDATING_OTHER_USER = "Updating User info created by other User is not allowed"
ERROR_UPDATING_OWN_ACCOUNT_IS_ACTIVE_TO_FALSE = (
    "You cannot set own account to is_active=False"
)

ERROR_UPDATING_OWN_ACCOUNT_USER_TYPE = (
    "You cannot change the UserType of your own account"
)

ERROR_UPDATING_OTHER_COMPANY_USER = (
    "Updating user is not allowed because the user belongs to a different company."
)
ERROR_ONLY_ALPHANUMERIC_CHARACTER_ARE_ALLOWED = (
    "Only alphanumeric characters are allowed."
)

ERROR_API_KEY_EXISTS = "API-KEY already exists"
ERROR_NO_USER_SPECIFIED_IN_QUERY_PARMAS = "No user Specified"
ERROR_USERNAME_ALREADY_CHANGED = "You have already changed your username"
ERROR_USERNAME_VALUE_NOT_PROVIDED = "No Value Provided for the Username"


def error_setting_invalid_user_type_message(user_type):
    return f"Setting User of type {user_type} is not allowed."


def error_image_file_size_limit_reached(max_size_kb):
    return f"Image file cannot be larger than {max_size_kb} KB"


# send_livedata app
ERROR_INVALID_ASSIGNMENT = (
    "Instance should only be associate with either Admin user or Company"
)


# websocket app
ERROR_INVALID_TOKEN = "Invalid or Expired Token provided"
ERROR_NO_TOKEN_PROVIDED = "No Token provided"


# sensor app
ERROR_SENSOR_NOT_FOUND = "Sensor does not exist"
ERROR_EMPTY_DICT = "No value is provided in the fieldname_sensor_dictionary"
ERROR_UPDATE_NO_FIELD_NAME = "No value is provided for updating the field_name"
ERROR_SENSOR_NOT_ASSOCIATED_WITH_COMPANY = (
    "Provided Sensor is not associated with the Company"
)
ERROR_SENSOR_NOT_ASSOCIATED_WITH_ADMIN_USER = (
    "Provided Sensor is not associated with the admin user"
)

ERROR_EMPTY_COMPANY_SENSOR_LIST = "Company does not have any sensor associated with it."
ERROR_EMPTY_ADMIN_USER_SENSOR_LIST = (
    "Admin user does not have any sensor associated with it."
)


def error_assigned_sensor(name, field):
    return f"Sensor {name} is already assign to {field}"


#  sensordata app
ERROR_NO_VALUE = "Request data is empty"
ERROR_NO_SENSOR_ASSOCIATED_WITH_ADMIN_USER = (
    "No sensor is associated with the Admin user"
)
ERROR_NO_SENSOR_ASSOCIATED_WITH_COMPANY = "No sensor is associated with the company"
