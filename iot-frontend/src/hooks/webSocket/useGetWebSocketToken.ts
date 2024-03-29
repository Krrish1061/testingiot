import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useAxios from "../../api/axiosInstance";
import { enqueueSnackbar } from "notistack";
import useWebSocketStore from "../../store/webSocketStore";

interface WebsocketToken {
  token: string;
}

function useGetWebSocketToken() {
  const axiosInstance = useAxios();
  const setConnectionState = useWebSocketStore(
    (state) => state.setConnectionState
  );
  const webSocketToken = () =>
    axiosInstance.post<WebsocketToken>("/websocket/token/").then((res) => {
      return res.data;
    });

  return useMutation<WebsocketToken, AxiosError>({
    mutationFn: webSocketToken,
    onError: () => {
      enqueueSnackbar("Failed to establish the Live Connection.", {
        variant: "error",
      });
      setConnectionState("disconnected");
    },
  });
}

export default useGetWebSocketToken;
