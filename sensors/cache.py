from caching.cache import Cache
from company.cache import CompanyCache
from dealer.cache import DealerCache
from sensors.models import Sensor
from users.cache import UserCache


class SensorCaching(Cache):
    app_name = "sensor"
    cache_key = "sensor_list"

    def __get_queryset(self, sensor_name: str):
        return Sensor.objects.filter(name=sensor_name)

    def __get_company_sensor_cache_key(self, company_slug):
        return f"company_sensor_{company_slug}"

    def __get_dealer_sensor_cache_key(self, dealer_slug):
        return f"dealer_sensor_{dealer_slug}"

    def __get_admin_user_sensor_cache_key(self, username):
        return f"admin_user_sensor_{username}"

    def __get_sensor_by_name(self, sensor_name: str) -> object | None:
        cached_data = self.get(self.cache_key)
        if cached_data:
            result = next(
                (sensor for sensor in cached_data if sensor.name == sensor_name),
                None,
            )
            return result
        return None

    def get_sensor(self, sensor_name: str):
        sensor = self.__get_sensor_by_name(sensor_name)
        if not sensor:
            try:
                sensor = Sensor.objects.get(name=sensor_name)
                self.set_to_list(
                    cache_key=self.cache_key,
                    app_name=self.app_name,
                    data=self.__get_queryset(sensor_name),
                )
            except Sensor.DoesNotExist:
                return None
        return sensor

    def get_all_sensor(self):
        sensors = self.get_all(self.cache_key, self.app_name)
        if sensors is None:
            sensors = Sensor.objects.all()
            self.set_all(
                self.cache_key,
                self.app_name,
                data=sensors,
            )
        return sensors

    def set_sensor(self, sensor):
        sensor_queryset = self.__get_queryset(sensor.name)
        self.set_to_list(self.cache_key, self.app_name, sensor_queryset)

    def delete_sensor(self, sensor_id: int):
        self.delete_from_list(self.cache_key, self.app_name, id=sensor_id)

    def handle_name_change(self):
        # delete all the device sensor and sensor associated with company and user from the cache to reflect sensor name change
        self.delete_pattern(
            patterns=("device_sensor_*", "company_sensor_*", "admin_user_sensor_*")
        )

    def get_all_company_sensor(self, company=None, company_slug=None) -> list:
        """Return the list of all the sensor name that company owns"""
        company_slug = company.slug if company else company_slug
        cache_key = self.__get_company_sensor_cache_key(company_slug)
        company_sensors = self.get(cache_key=cache_key)
        if company_sensors is None:
            if company is None:
                company = CompanyCache.get_company(company_slug)
            company_sensors = (
                company.iot_device.prefetch_related("iot_device_sensors")
                .exclude(iot_device_sensors__sensor__name__isnull=True)
                .values_list("iot_device_sensors__sensor__name", flat=True)
                .distinct()
            )
            self.set(cache_key=cache_key, data=company_sensors)
        return company_sensors

    def get_all_user_sensor(self, user=None, username=None) -> list:
        """Return the list of all the sensor name that admin user owns"""
        username = user.username if user else username
        cache_key = self.__get_admin_user_sensor_cache_key(username)
        user_sensors = self.get(cache_key=cache_key)
        if user_sensors is None:
            if user is None:
                user = UserCache.get_user(username)
            user_sensors = (
                user.iot_device.prefetch_related("iot_device_sensors")
                .exclude(iot_device_sensors__sensor__name__isnull=True)
                .values_list("iot_device_sensors__sensor__name", flat=True)
                .distinct()
            )
            self.set(cache_key=cache_key, data=user_sensors)

        return user_sensors

    def get_all_dealer_sensor(self, dealer=None, dealer_slug=None) -> list:
        """Return the list of all the sensor name that dealer user owns"""
        dealer_slug = dealer.slug if dealer else dealer_slug
        cache_key = self.__get_dealer_sensor_cache_key(dealer_slug)
        dealer_sensors = self.get(cache_key=cache_key)
        if dealer_sensors is None:
            if dealer is None:
                dealer = DealerCache.get_dealer(dealer_slug)

            dealer_sensors = (
                dealer.iot_device.prefetch_related("iot_device_sensors")
                .exclude(iot_device_sensors__sensor__name__isnull=True)
                .values_list("iot_device_sensors__sensor__name", flat=True)
                .distinct()
            )
            self.set(cache_key=cache_key, data=dealer_sensors)
        return dealer_sensors


SensorCache = SensorCaching()
