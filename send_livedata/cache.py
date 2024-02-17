from caching.cache import Cache
from send_livedata.models import SendLiveDataList


class SendLiveDataCaching(Cache):
    app_name = "send_livedata"
    cache_key = "send_livedata_list"

    def __get_queryset(self, id: int):
        return SendLiveDataList.objects.select_related("user", "company").filter(pk=id)

    def __get_send_livedata_by_id(self, id: int):
        cached_data = self.get(self.cache_key)
        if cached_data:
            result = next(
                (data for data in cached_data if data.id == id),
                None,
            )
            return result
        return None

    def __get_send_livedata_by_user(self, username: str):
        cached_data = self.get(self.cache_key)
        if cached_data:
            result = next(
                (
                    data
                    for data in cached_data
                    if data.user and data.user.username == username
                ),
                None,
            )
            return result
        return None

    def __get_send_livedata_by_company_slug(self, company_slug: str):
        cached_data = self.get(self.cache_key)
        if cached_data:
            result = next(
                (
                    data
                    for data in cached_data
                    if data.company and data.company.slug == company_slug
                ),
                None,
            )
            return result
        return None

    def get_all_send_livedata(self):
        send_livedata = self.get_all(self.cache_key, self.app_name)
        if send_livedata is None:
            send_livedata = SendLiveDataList.objects.select_related(
                "user", "company"
            ).all()
            self.set_all(
                self.cache_key,
                self.app_name,
                data=send_livedata,
            )

        return send_livedata

    def get_send_livedata(self, id: int):
        send_livedata = self.__get_send_livedata_by_id(id)
        if send_livedata is None:
            try:
                send_livedata = SendLiveDataList.objects.select_related(
                    "user", "company"
                ).get(pk=id)
                self.set_to_list(
                    cache_key=self.cache_key,
                    app_name=self.app_name,
                    data=send_livedata,
                )

            except SendLiveDataList.DoesNotExist:
                return None
        return send_livedata

    def get_send_livedata_by_user(self, username: int):
        send_livedata = self.__get_send_livedata_by_user(username)
        if send_livedata is None:
            try:
                send_livedata = SendLiveDataList.objects.select_related(
                    "user", "company"
                ).get(user__username=username)
                self.set_to_list(
                    cache_key=self.cache_key,
                    app_name=self.app_name,
                    data=send_livedata,
                )

            except SendLiveDataList.DoesNotExist:
                return None
        return send_livedata

    def get_send_livedata_by_company(self, company_slug: str):
        send_livedata = self.__get_send_livedata_by_company_slug(company_slug)
        if send_livedata is None:
            try:
                send_livedata = SendLiveDataList.objects.select_related(
                    "user", "company"
                ).get(company__slug=company_slug)

                self.set_to_list(
                    cache_key=self.cache_key,
                    app_name=self.app_name,
                    data=send_livedata,
                )

            except SendLiveDataList.DoesNotExist:
                return None
        return send_livedata

    def set_send_livedata(self, send_livedata):
        send_livedata_queryset = self.__get_queryset(send_livedata.id)
        self.set_to_list(self.cache_key, self.app_name, send_livedata_queryset)

    def delete_send_livedata(self, send_livedata_id: int):
        self.delete_from_list(self.cache_key, self.app_name, id=send_livedata_id)


SendLiveDataCache = SendLiveDataCaching()
