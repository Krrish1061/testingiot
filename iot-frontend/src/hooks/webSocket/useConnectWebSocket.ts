import { useEffect } from "react";
import useWebSocketStore from "../../store/webSocket/webSocketStore";
import useGetWebSocketToken from "./useGetWebSocketToken";

function useConnectWebSocket() {
  const connectToWebsocket = useWebSocketStore(
    (state) => state.connectToWebsocket
  );
  const websocket = useWebSocketStore((state) => state.websocket);
  const {
    data: webSocketToken,
    mutateAsync: getWebSocketToken,
    isSuccess,
  } = useGetWebSocketToken();

  const websocketEndpoint = import.meta.env.VITE_WEBSOCKET_ENDPOINT;

  useEffect(() => {
    if (!websocket && isSuccess) {
      connectToWebsocket(websocketEndpoint + "?token=" + webSocketToken.token);
    }
    if (!websocket && !isSuccess) {
      (async () => await getWebSocketToken())();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [websocket, isSuccess]);
}

export default useConnectWebSocket;
