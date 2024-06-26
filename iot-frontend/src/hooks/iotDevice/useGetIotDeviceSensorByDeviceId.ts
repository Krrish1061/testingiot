import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { enqueueSnackbar } from "notistack";
import useAxios from "../../api/axiosInstance";
import IotDeviceSensor from "../../entities/IotDeviceSensor";

interface IError {
  error: string;
}

function useGetIotDeviceSensorByDeviceId(deviceId: number | null) {
  const axiosInstance = useAxios();

  const getIotDeviceSensor = () =>
    axiosInstance
      .get<IotDeviceSensor[]>(`iot-device/device-sensors/${deviceId}`)
      .then((res) => res.data);

  return useQuery<IotDeviceSensor[], AxiosError<IError>>({
    queryKey: ["device-sensors", deviceId],
    queryFn: getIotDeviceSensor,
    enabled: Boolean(deviceId),
    initialData: undefined,
    retryOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
    cacheTime: 0,
    staleTime: 0,
    onError: (error) => {
      enqueueSnackbar(
        error.response?.data.error ||
          "Failed to get the Device Sensor for the Iot Device",
        {
          variant: "error",
        }
      );
    },
  });
}

export default useGetIotDeviceSensorByDeviceId;
