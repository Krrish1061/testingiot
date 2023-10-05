from caching.cache import Cache
from .models import Company
from caching.cache_key import COMPANY_LIST_CACHE_KEY, COMPANY_LIST_CACHE_KEY_APP_NAME


def get_company(company_id: int):
    company = Cache.get_from_list(COMPANY_LIST_CACHE_KEY, company_id)
    if not company:
        try:
            company = Company.objects.select_related("profile").get(pk=company_id)
            Cache.set_to_list(
                cache_key=COMPANY_LIST_CACHE_KEY,
                app_name=COMPANY_LIST_CACHE_KEY_APP_NAME,
                data=company,
            )
        except Company.DoesNotExist:
            return None
    return company


def is_slugId_ofSameInstance(company_slug, id: int):
    company = get_company(id)
    if company and company.slug == company_slug:
        return (True, company)
    return (False, None)
