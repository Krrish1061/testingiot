import hashlib
from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist
from caching.cache import Cache


User = get_user_model()


class UserCaching(Cache):
    app_name = "user"
    cache_key = "user_list"

    def __generate_cache_key_from_api_key(self, api_key: str):
        # Using a secure hash function to generate a deterministic cache key
        return hashlib.sha256(api_key.encode()).hexdigest()

    def __get_queryset(self, username: str):
        return (
            User.objects.select_related("company", "created_by", "profile")
            .prefetch_related("groups")
            .filter(username=username)
        )

    def __get_user_by_username(self, username: str) -> object | None:
        cached_data = self.get(self.cache_key)

        if cached_data:
            result = next(
                (user for user in cached_data if user.username == username),
                None,
            )
            return result
        return None

    def __get_user_by_email(self, email: str) -> object | None:
        cached_data = self.get(self.cache_key)

        if cached_data:
            result = next(
                (user for user in cached_data if user.email == email),
                None,
            )
            return result
        return None

    def get_user(self, username):
        user = self.__get_user_by_username(username)
        if user is None:
            try:
                user = (
                    User.objects.select_related("company", "created_by", "profile")
                    .prefetch_related("groups")
                    .get(username=username)
                )
                # self.__get_queryset_user_by_id(username)
                self.set_to_list(
                    cache_key=self.cache_key,
                    app_name=self.app_name,
                    data=self.__get_queryset(username),
                )
            except ObjectDoesNotExist:
                return None

        return user

    def get_user_by_email(self, email: str):
        user = self.__get_user_by_email(email)
        if user is None:
            try:
                user = (
                    User.objects.select_related("company", "created_by", "profile")
                    .prefetch_related("groups")
                    .get(email=email)
                )
                self.set_to_list(
                    cache_key=self.cache_key,
                    app_name=self.app_name,
                    data=user,
                )
            except ObjectDoesNotExist:
                return None

        return user

    def get_all_users(self):
        users = self.get_all(self.cache_key, self.app_name)
        if users is None:
            users = (
                User.objects.select_related("company", "created_by", "profile")
                .prefetch_related("groups")
                .all()
            )
            self.set_all(
                self.cache_key,
                self.app_name,
                data=users,
            )
        return users

    def set_user(self, user):
        user_queryset = self.__get_queryset(user.username)
        self.set_to_list(self.cache_key, self.app_name, user_queryset)

    def delete_user(self, user_id, api_key=None):
        self.delete_from_list(self.cache_key, self.app_name, id=user_id)
        if api_key:
            self.delete_auth_cache_user(api_key)

    def get_profile(self, username):
        user = self.get_user(username)
        if not user:
            return None
        user_profile = user.profile
        return user_profile

    def delete_profile(self, user_id):
        self.delete_user(user_id)

    def get_user_by_api_key(self, api_key: str):
        cache_key = self.__generate_cache_key_from_api_key(api_key)
        user = self.get(cache_key)
        if not user:
            try:
                user = User.objects.select_related("company").get(api_key=api_key)
                self.set(cache_key, user)
            except User.DoesNotExist:
                return None
        return user

    def delete_auth_cache_user(self, user=None, api_key=None):
        """Delete the user in cache that is being used for authetication of user"""
        api_key = api_key if api_key else user.api_key
        cache_key = self.__generate_cache_key_from_api_key(api_key)
        self.delete(cache_key)


UserCache = UserCaching()
