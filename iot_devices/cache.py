from caching.cache import Cache
from iot_devices.models import IotDevice, IotDeviceSensor
from company.cache import CompanyCache
import hashlib

from users.cache import UserCache


class IotDeviceCaching(Cache):
    app_name = "iot_devices"
    cache_key = "iot_devices_list"

    def __generate_cache_key_from_api_key(self, api_key: str):
        # Using a secure hash function to generate a deterministic cache key
        return hashlib.sha256(api_key.encode()).hexdigest()

    def __get_device_sensor_cache_key(self, device_id: int):
        return f"device_sensor_{device_id}"

    def __get__user_device_cache_key(self, username: str):
        return f"user_device_{username}"

    def __get_company_device_cache_key(self, company_slug: str):
        return f"company_device_{company_slug}"

    def __get_queryset(self, iot_device_id: int):
        return IotDevice.objects.select_related(
            "user", "company", "iot_device_details"
        ).filter(pk=iot_device_id)

    def __get_iot_device_by_id(self, iot_device_id: int) -> object | None:
        cached_data = self.get(self.cache_key)
        if cached_data:
            result = next(
                (
                    iot_device
                    for iot_device in cached_data
                    if iot_device.id == iot_device_id
                ),
                None,
            )
            return result
        return None

    def get_iot_device(self, iot_device_id):
        iot_device = self.__get_iot_device_by_id(iot_device_id)
        if iot_device is None:
            try:
                iot_device = IotDevice.objects.select_related(
                    "user", "company", "iot_device_details"
                ).get(pk=iot_device_id)
                self.set_to_list(
                    cache_key=self.cache_key,
                    app_name=self.app_name,
                    data=self.__get_queryset(iot_device_id),
                )
            except IotDevice.DoesNotExist:
                return None
        return iot_device

    def get_all_iot_devices(self):
        iot_devices = self.get_all(self.cache_key, self.app_name)
        if iot_devices is None:
            iot_devices = IotDevice.objects.select_related(
                "user",
                "company",
                "iot_device_details",
            ).all()
            # prefetch related for iot_device_sensors
            self.set_all(
                self.cache_key,
                self.app_name,
                data=iot_devices,
            )

        return iot_devices

    def set_iot_device(self, iot_device):
        queryset = self.__get_queryset(iot_device.id)
        self.set_to_list(self.cache_key, self.app_name, queryset)
        cache_key = (
            self.__get_company_device_cache_key(iot_device.company.slug)
            if iot_device.company
            else self.__get__user_device_cache_key(iot_device.user.username)
        )
        self.delete(cache_key)

    def delete_iot_device(
        self, iot_device_id: int, system_delete=False, company_slug=None, username=None
    ):
        self.delete_from_list(self.cache_key, self.app_name, id=iot_device_id)
        cache_key = (
            self.__get_company_device_cache_key(company_slug)
            if company_slug
            else self.__get__user_device_cache_key(username)
        )
        self.delete(cache_key)

        if system_delete:
            self.delete_device_sensors(iot_device_id)
            # self.delete_auth_cache_iot_device(iot_device_id) need to send iot_device

    def get_all_device_sensors(self, device_id):
        """Returns the IotDeviceSensor Models, all instances associated with the Iot device"""
        cache_key = self.__get_device_sensor_cache_key(device_id)
        device_sensors = self.get(cache_key)
        if device_sensors is None:
            device_sensors = IotDeviceSensor.objects.select_related("sensor").filter(
                iot_device=device_id
            )
            self.set(cache_key, data=device_sensors)
        return device_sensors

    def delete_device_sensors(self, device_id):
        cache_key = self.__get_device_sensor_cache_key(device_id)
        self.delete(cache_key)

    def get_iot_device_by_api_key(self, api_key: str):
        cache_key = self.__generate_cache_key_from_api_key(api_key)
        iot_device = self.get(cache_key)

        if iot_device is None:
            try:
                iot_device = IotDevice.objects.select_related("user", "company").get(
                    api_key=api_key
                )
                self.set(cache_key, iot_device)

            except IotDevice.DoesNotExist:
                return None
        return iot_device

    def delete_auth_cache_iot_device(self, iot_device):
        """Delete the iot device in cache that is being used for authetication of device"""
        api_key = iot_device.api_key if iot_device.api_key else None
        if api_key:
            cache_key = self.__generate_cache_key_from_api_key(api_key)
            self.delete(cache_key)

    def get_all_user_iot_devices(self, user=None, username=None):
        """Return the list of all the iot devices that admin user owns"""
        username = user.username if user else username
        cache_key = self.__get__user_device_cache_key(username)
        user_devices = self.get(cache_key)
        if user_devices is None:
            if user is None:
                user = UserCache.get_user(username)
            user_devices = user.iot_device.values_list("id", flat=True)
            self.set(cache_key=cache_key, data=user_devices)
        return user_devices

    def get_all_company_iot_devices(self, company=None, company_slug=None):
        """Return the list of all the iot devices that company owns"""
        company_slug = company.slug if company else company_slug
        cache_key = self.__get_company_device_cache_key(company_slug)
        company_devices = self.get(cache_key)
        if company_devices is None:
            if company is None:
                company = CompanyCache.get_company(company_slug)
            company_devices = company.iot_device.values_list("id", flat=True)
            self.set(cache_key=cache_key, data=company_devices)
        return company_devices


IotDeviceCache = IotDeviceCaching()
