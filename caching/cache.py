from django.core.cache import cache


class Cache:
    CACHE_TTL = 120  # 300 seconds

    def cache_key_list_created_with_single_element(app_name):
        return f"{app_name}_list_created_with_single_element"

    @staticmethod
    def get_all(cache_key: str, app_name: str) -> object | None:
        is_list_created_with_single_element = (
            Cache.cache_key_list_created_with_single_element(app_name)
        )
        cached_data = cache.get_many((cache_key, is_list_created_with_single_element))
        if cached_data.get(is_list_created_with_single_element):
            return None
        return cached_data.get(cache_key)

    @staticmethod
    def set_all(cache_key: str, app_name: str, data) -> None:
        # store the in the cache only if there is some vaue in data
        if data:
            cached_data = {
                cache_key: data,
                Cache.cache_key_list_created_with_single_element(app_name): False,
            }
            cache.set_many(cached_data, Cache.CACHE_TTL)

    @staticmethod
    def get_from_list(cache_key: str, id: int) -> object | None:
        cached_data = cache.get(cache_key)
        print("inside get_from_list cache class=", cached_data)
        if cached_data:
            result = next(
                (data for data in cached_data if data.id == id),
                None,
            )
            return result
        return None

    @staticmethod
    def get_sensor_by_name(cache_key: str, name: str) -> object | None:
        cached_data = cache.get(cache_key)
        print("inside get_sensor_by_name cache class=", cached_data)
        if cached_data:
            result = next(
                (data for data in cached_data if data.name == name),
                None,
            )
            return result
        return None

    @staticmethod
    def get_company_sensor_by_name(cache_key: str, name: str) -> object | None:
        cached_data = cache.get(cache_key)
        print("inside get_company_sensor_by_name cache class=", cached_data)
        if cached_data:
            result = next(
                (data for data in cached_data if data.sensor.name == name),
                None,
            )
            return result
        return None

    @staticmethod
    def get_company_by_slug(cache_key: str, slug: str) -> object | None:
        cached_data = cache.get(cache_key)
        print("inside get_company_by_slug cache class=", cached_data)
        if cached_data:
            result = next(
                (data for data in cached_data if data.slug == slug),
                None,
            )
            return result
        return None

    @staticmethod
    def get_user_by_username(cache_key: str, username: str) -> object | None:
        cached_data = cache.get(cache_key)
        print("inside get_company_by_slug cache class=", cached_data)
        if cached_data:
            result = next(
                (data for data in cached_data if data.username == username),
                None,
            )
            return result
        return None

    @staticmethod
    def set_to_list(cache_key: str, app_name: str, data) -> None:
        if data:
            cached_data = cache.get(cache_key)
            print("inside set_to_list cache class=", cached_data)
            if cached_data:
                cached_data.append(data)
                cache.set(cache_key, cached_data, Cache.CACHE_TTL)
            else:
                cached_data = {
                    cache_key: [data],
                    Cache.cache_key_list_created_with_single_element(app_name): True,
                }
                cache.set_many(cached_data, Cache.CACHE_TTL)

    @staticmethod
    def delete_from_list(cache_key: str, id: int) -> None:
        cached_data = cache.get(cache_key)
        print("inside delete_from_list cache class=", cached_data)
        if cached_data:
            item_to_delete = next(
                (data for data in cached_data if data.id == id),
                None,
            )
            if item_to_delete:
                cached_data.remove(item_to_delete)
                Cache.set(cache_key, cached_data)

    @staticmethod
    def get(cache_key: str) -> object | None:
        cached_data = cache.get(cache_key)
        # print("inside get cache class=", cached_data)
        return cached_data if cached_data else None

    @staticmethod
    def set(cache_key: str, data) -> None:
        if data:
            cache.set(cache_key, data, Cache.CACHE_TTL)

    @staticmethod
    def delete(cache_key: str) -> None:
        cache.delete(cache_key)
