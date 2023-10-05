# user app
USER_LIST_CACHE_KEY = "user_list"
USER_LIST_CACHE_KEY_APP_NAME = "user"


# delete all cache if username is changed
def get_user_profile_cache_key(username: str) -> str:
    return f"{username}_profile"


# company app
COMPANY_LIST_CACHE_KEY = "company_list"
COMPANY_LIST_CACHE_KEY_APP_NAME = "company"


# delete all cache if compnay_slug is changed
def get_company_profile_cache_key(company_slug: str) -> str:
    return f"{company_slug}_profile"


# iot_devices app
IOT_DEVICE_LIST_CACHE_KEY = "iot_device_list"
IOT_DEVICE_LIST_CACHE_KEY_APP_NAME = "iot_device"

# send_livedata_app
SEND_LIVE_DATA_LIST_CACHE_KEY = "send_livedata_list"
SEND_LIVE_DATA_LIST_CACHE_KEY_APP_NAME = "send_livedata"

# sensor app
SENSOR_LIST_CACHE_KEY = "sensor_list"
SENSOR_LIST_CACHE_KEY_APP_NAME = "sensor"

COMPANY_SENSOR_APP_NAME = "company_sensors"


def get_company_sensor_cache_key(company_slug):
    return f"company_sensor_{company_slug}"


ADMIN_USER_SENSOR_APP_NAME = "admin_user_sensors"


def get_admin_user_sensor_cache_key(username):
    return f"admin_user_sensor_{username}"
