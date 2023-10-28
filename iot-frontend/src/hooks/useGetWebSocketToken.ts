import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useAxios from "../api/axiosInstance";
import { enqueueSnackbar } from "notistack";

interface WebsocketToken {
  token: string;
}

function useGetWebSocketToken() {
  const axiosInstance = useAxios();
  const webSocketToken = () =>
    axiosInstance.post<WebsocketToken>("/websocket/token/").then((res) => {
      return res.data;
    });

  return useMutation<WebsocketToken, AxiosError>({
    mutationFn: webSocketToken,
    onError: () => {
      enqueueSnackbar("Failed to establish the websocket Connection", {
        variant: "error",
      });
    },
  });
}

export default useGetWebSocketToken;
