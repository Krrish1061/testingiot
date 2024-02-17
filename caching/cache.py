from django.core.cache import cache
from abc import ABC


class Cache(ABC):
    CACHE_TTL = 604800  # value in seconds = 1week

    # later do it in __init__ method
    def __generate_cache_key(app_name):
        # returns cache_key which stores whether to fetch data list from the database
        return f"{app_name}_fetch_list"

    @staticmethod
    def get_all(cache_key: str, app_name: str) -> object | None:
        is_fetch_list = Cache.__generate_cache_key(app_name)
        cached_data = cache.get_many((cache_key, is_fetch_list))
        # if is_fetch_list is true then fetch data from the database
        if cached_data.get(is_fetch_list):
            return None
        return cached_data.get(cache_key)

    @staticmethod
    def set_all(cache_key: str, app_name: str, data, is_fetch_list=False) -> None:
        # store the in the cache only if there is some vaue in data
        # if data is of empty list there will be cache no being saved which causing query to execute always
        # if data:
        cached_data = {
            cache_key: data,
            Cache.__generate_cache_key(app_name): is_fetch_list,
        }
        cache.set_many(cached_data, Cache.CACHE_TTL)

    @staticmethod
    def get_from_list(cache_key: str, id: int) -> object | None:
        cached_data = cache.get(cache_key)
        if cached_data:
            result = next(
                (data for data in cached_data if data.id == id),
                None,
            )
            return result
        return None

    @staticmethod
    def set_to_list(cache_key: str, app_name: str, data) -> None:
        cached_data = cache.get(cache_key)
        if cached_data:
            # print("cach", cached_data, type(cached_data))
            # combines the query set
            cached_data = (
                cached_data.append(data)
                if type(cached_data) == list
                else cached_data | data
            )
            cache.set(cache_key, cached_data, Cache.CACHE_TTL)
        else:
            cached_data = {
                cache_key: [data],  # [data]
                Cache.__generate_cache_key(app_name): True,
            }
            cache.set_many(cached_data, Cache.CACHE_TTL)

    @staticmethod
    def delete_from_list(cache_key: str, app_name: str, id: int) -> None:
        cached_data = cache.get(cache_key)
        if cached_data:
            item_to_delete = next(
                (data for data in cached_data if data.id == id),
                None,
            )
            if item_to_delete:
                cached_data = (
                    cached_data.remove(item_to_delete)
                    if type(cached_data) == list
                    else cached_data.exclude(pk=item_to_delete.id)
                )
                Cache.set_all(cache_key, app_name, cached_data, is_fetch_list=True)

    @staticmethod
    def get(cache_key: str) -> object | None:
        cached_data = cache.get(cache_key)
        return cached_data

    @staticmethod
    def set(cache_key: str, data, ttl=CACHE_TTL) -> None:
        cache.set(cache_key, data, ttl)

    @staticmethod
    def delete(cache_key: str) -> None:
        cache.delete(cache_key)

    @staticmethod
    def set_many(cache_data: dict, ttl=CACHE_TTL) -> None:
        cache.set_many(cache_data, ttl)
