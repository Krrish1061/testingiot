from collections import defaultdict
from django.core.paginator import Page, Paginator, PageNotAnInteger
from django.utils.functional import cached_property
from rest_framework.utils.urls import remove_query_param, replace_query_param
from math import ceil


class SensorDataPaginator(Paginator):
    page_size_query_param = "page_size"
    sensor_query_param = "sensors"
    max_page_size = 500
    page_query_param = "page"

    def __init__(
        self,
        object_list,
        per_page,
        is_associated_with_company,
        sensor_names,
        orphans=0,
        allow_empty_first_page=True,
    ):
        if per_page > self.max_page_size:
            per_page = self.max_page_size
        super().__init__(object_list, per_page, orphans, allow_empty_first_page)
        self.sensor_names = sensor_names
        self.is_associated_with_company = is_associated_with_company

    def get_sensors(self, request):
        try:
            sensors = request.query_params[self.sensor_query_param].lower().split(",")
            if sensors:
                sensors = set(sensors)
                sensors.intersection_update(self.sensor_names)
                return sensors if sensors else self.sensor_names
            else:
                return self.sensor_names

        except (KeyError, ValueError):
            return self.sensor_names

    def page(self, number, request):
        """Return a Page object for the given 1-based page number."""
        number = self.validate_number(number)
        bottom = (number - 1) * self.per_page
        top = bottom + self.per_page
        if top >= self.count:
            top = self.count

        sensors_data = defaultdict(list)
        sensors = self.get_sensors(request)

        # improve later
        if self.is_associated_with_company:
            for sensor in sensors:
                sensors_data[sensor].append(
                    self.object_list.filter(company_sensor__sensor__name=sensor)
                )
        else:
            for sensor in sensors:
                sensors_data[sensor].append(
                    self.object_list.filter(user_sensor__sensor__name=sensor)
                )

        sensor_data = {
            sensor: querysets[0][bottom:top] if querysets else None
            for sensor, querysets in sensors_data.items()
        }

        # call the super class method instead of defining it here
        return self._get_page(sensor_data, number, self)

    def _get_page(self, *args, **kwargs):
        """
        Return an instance of a single page.
        This hook can be used by subclasses to use an alternative to the
        standard :cls:`Page` object.
        """
        return Page(*args, **kwargs)

    def get_next_link(self, page, request):
        if not page.has_next():
            return None
        url = request.build_absolute_uri()
        page_number = page.next_page_number()
        return replace_query_param(url, self.page_query_param, page_number)

    def get_previous_link(self, page, request):
        if not page.has_previous():
            return None
        url = request.build_absolute_uri()
        page_number = page.previous_page_number()
        if page_number == 1:
            return remove_query_param(url, self.page_query_param)
        return replace_query_param(url, self.page_query_param, page_number)

    @cached_property
    def num_pages(self):
        """Return the total number of pages."""
        if self.count == 0 and not self.allow_empty_first_page:
            return 0
        # handle division by zero when there are no sensor names
        length = len(self.sensor_names) if len(self.sensor_names) != 0 else 1
        hits = max(1, (self.count / length))
        return ceil(hits / self.per_page)
