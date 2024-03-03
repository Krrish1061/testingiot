import { useEffect } from "react";
import useWebSocketStore from "../../store/webSocketStore";
import useGetWebSocketToken from "./useGetWebSocketToken";

function useConnectWebSocket() {
  const connectWebSocket = useWebSocketStore((state) => state.connectWebSocket);
  const websocket = useWebSocketStore((state) => state.websocket);
  const {
    data: webSocketToken,
    mutateAsync: getWebSocketToken,
    isSuccess,
  } = useGetWebSocketToken();

  const websocketEndpoint = import.meta.env.VITE_WEBSOCKET_ENDPOINT;

  useEffect(() => {
    if (!websocket && isSuccess) {
      connectWebSocket(websocketEndpoint + "?token=" + webSocketToken.token);
    }
    if (!websocket && !isSuccess) {
      (async () => await getWebSocketToken())();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [websocket, isSuccess]);
}

export default useConnectWebSocket;
