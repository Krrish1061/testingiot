from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist
from caching.cache import Cache


User = get_user_model()


class UserCaching(Cache):
    app_name = "user"
    cache_key = "user_list"

    def get_user_by_username(self, username: str) -> object | None:
        cached_data = self.get(self.cache_key)
        if cached_data:
            result = next(
                (user for user in cached_data if user.username == username),
                None,
            )
            return result
        return None

    def get_user(self, username):
        user = self.get_user_by_username(username)
        if user is None:
            try:
                user = (
                    User.objects.select_related("company", "created_by", "profile")
                    .prefetch_related("groups")
                    .get(username=username)
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
        self.set_to_list(self.cache_key, self.app_name, user)

    def delete_user(self, user_id):
        self.delete_from_list(self.cache_key, self.app_name, id=user_id)

    def get_profile(self, username):
        user = self.get_user(username)
        if not user:
            return None
        user_profile = user.profile
        return user_profile

    def delete_profile(self, user_id):
        self.delete_user(user_id)


UserCache = UserCaching()
