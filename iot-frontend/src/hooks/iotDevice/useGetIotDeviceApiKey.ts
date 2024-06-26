import { AxiosError } from "axios";
import useAxios from "../../api/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";

interface IResponse {
  api_key: string;
}

function useGetIotDeviceApiKey(iotDeviceId: number | null) {
  const axiosInstance = useAxios();

  const getIotDeviceApiKey = () =>
    axiosInstance
      .get<IResponse>(`iot-device/${iotDeviceId}/get/api-key/`)
      .then((res) => res.data);

  return useQuery<IResponse, AxiosError>({
    queryKey: ["api-key", iotDeviceId],
    queryFn: getIotDeviceApiKey,
    enabled: Boolean(iotDeviceId),
    initialData: undefined,
    retryOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
    cacheTime: 0,
    staleTime: 0,
    onError: () => {
      enqueueSnackbar("Failed to get the APi-Key for the Iot Device", {
        variant: "error",
      });
    },
  });
}

export default useGetIotDeviceApiKey;
