from caching.cache import Cache


class WebSocketCaching(Cache):
    app_name = "websocket"
    cache_key = "websocket_token"
    CACHE_TTL = 300  # value in sec for 5 minutes

    def __get_wesocket_cache_key(self, username):
        return f"websocket_token_{username}"

    def get_websocket_token(self, username):
        cache_key = self.__get_wesocket_cache_key(username)
        return self.get(cache_key)

    def set_websocket_token(self, username, webSocketToken):
        cache_key = self.__get_wesocket_cache_key(username)
        cached_data = {cache_key: webSocketToken, webSocketToken.token: webSocketToken}
        self.set_many(cached_data, self.CACHE_TTL)

    def get_websocket_by_token_key(self, token):
        return self.get(token)


class ConnectedConsumersCaching(Cache):
    cache_key = "connected_consumers"

    def get_connected_consumers(self):
        return self.get(self.cache_key)

    def __handle_connect(self, group_name: str, cached_data: dict):
        if cached_data is not None:
            if group_name in cached_data:
                cached_data[group_name] += 1
        else:
            cached_data = {group_name: 1}

        return cached_data

    def __handle_disconnect(self, group_name: str, cached_data: dict | None):
        if cached_data and group_name in cached_data:
            current_value = cached_data[group_name]
            if current_value == 1:
                del cached_data[group_name]
            else:
                cached_data[group_name] -= 1

            return cached_data

    def set_connected_consumers(self, group_name: str, actions: str):
        cached_data = self.get_connected_consumers()
        if actions == "connect":
            cached_data = self.__handle_connect(group_name, cached_data)
        else:
            cached_data = self.__handle_disconnect(group_name, cached_data)
        self.set(cache_key=self.cache_key, data=cached_data)


WebSocketCache = WebSocketCaching()
ConnectedConsumersCache = ConnectedConsumersCaching()
