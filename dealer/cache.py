from caching.cache import Cache
from dealer.models import Dealer


class DealerCaching(Cache):
    app_name = "dealer"
    cache_key = "dealer_list"

    def __get_queryset(self, dealer_slug: str):
        return Dealer.objects.select_related("user").filter(slug=dealer_slug)

    def __get_dealer_by_slug(self, slug: str) -> object | None:
        cached_data = self.get(self.cache_key)
        if cached_data:
            result = next(
                (dealer for dealer in cached_data if dealer.slug == slug),
                None,
            )
            return result
        return None

    def __get_dealer_by_username(self, username: str) -> object | None:
        cached_data = self.get(self.cache_key)
        if cached_data:
            result = next(
                (dealer for dealer in cached_data if dealer.user.username == username),
                None,
            )
            return result
        return None

    def get_dealer(self, dealer_slug: str):
        dealer = self.__get_dealer_by_slug(dealer_slug)
        if not dealer:
            try:
                dealer = Dealer.objects.select_related("user").get(slug=dealer_slug)
                self.set_to_list(
                    cache_key=self.cache_key,
                    app_name=self.app_name,
                    data=self.__get_queryset(dealer_slug),
                )
            except Dealer.DoesNotExist:
                return None
        return dealer

    def get_dealer_by_user(self, username: str):
        dealer = self.__get_dealer_by_username(username)
        if not dealer:
            try:
                dealer = Dealer.objects.select_related("user").get(
                    user__username=username
                )
                self.set_to_list(
                    cache_key=self.cache_key,
                    app_name=self.app_name,
                    data=self.__get_queryset(dealer.slug),
                )
            except Dealer.DoesNotExist:
                return None
        return dealer

    def get_all_dealer(self):
        dealers = self.get_all(self.cache_key, self.app_name)
        if dealers is None:
            dealers = Dealer.objects.select_related("user").all()
            self.set_all(
                self.cache_key,
                self.app_name,
                data=dealers,
            )
        return dealers

    # def get_associated_user_and_company(self, username, company):
    #     dealers = self.get_all(self.cache_key, self.app_name)

    def set_dealer(self, dealer):
        dealer_queryset = self.__get_queryset(dealer.slug)
        self.set_to_list(self.cache_key, self.app_name, dealer_queryset)

    def delete_dealer(self, dealer_id: int):
        self.delete_from_list(self.cache_key, self.app_name, id=dealer_id)

    def get_dealer_profile(self, dealer_slug):
        dealer = self.get_dealer(dealer_slug)
        if not dealer:
            return None
        dealer_profile = dealer.profile
        return dealer_profile

    def delete_dealer_profile(self, dealer_profile):
        dealer_id = dealer_profile.dealer.id
        self.delete_dealer(dealer_id)


DealerCache = DealerCaching()
