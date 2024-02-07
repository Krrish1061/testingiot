from caching.cache import Cache
from company.models import Company


class CompanyCaching(Cache):
    app_name = "company"
    cache_key = "company_list"

    def __get_queryset(self, company_slug: str):
        return (
            Company.objects.select_related("profile")
            .prefetch_related("company_users")
            .filter(slug=company_slug)
        )

    def __get_company_by_slug(self, slug: str) -> object | None:
        cached_data = self.get(self.cache_key)
        if cached_data:
            result = next(
                (company for company in cached_data if company.slug == slug),
                None,
            )
            return result
        return None

    def get_company(self, company_slug: str):
        company = self.__get_company_by_slug(company_slug)
        if not company:
            try:
                company = (
                    Company.objects.select_related("profile")
                    .prefetch_related("company_users")
                    .get(slug=company_slug)
                )
                self.set_to_list(
                    cache_key=self.cache_key,
                    app_name=self.app_name,
                    data=company,
                )
            except Company.DoesNotExist:
                return None
        return company

    def get_all_company(self):
        companies = self.get_all(self.cache_key, self.app_name)
        if companies is None:
            companies = (
                Company.objects.select_related("profile")
                .prefetch_related("company_users")
                .all()
            )
            self.set_all(
                self.cache_key,
                self.app_name,
                data=companies,
            )
        return companies

    def set_company(self, company):
        company_queryset = self.__get_queryset(company.slug)
        self.set_to_list(self.cache_key, self.app_name, company_queryset)

    def delete_company(self, company_id: int):
        self.delete_from_list(self.cache_key, self.app_name, id=company_id)

    def get_company_profile(self, company_slug):
        company = self.get_company(company_slug)
        if not company:
            return None
        company_profile = company.profile
        return company_profile

    def delete_company_profile(self, company_profile):
        company_id = company_profile.company.id
        self.delete_company(company_id)

    def get_all_sensor(self, user) -> list:
        """Returns sensor list"""

        user_sensor = (
            user.iot_device.prefetch_related("iot_device_sensors")
            .values_list("iot_device_sensors__sensor__name", flat=True)
            .distinct()
        )

        return user_sensor


CompanyCache = CompanyCaching()
