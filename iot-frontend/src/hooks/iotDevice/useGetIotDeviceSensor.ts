import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useAxios from "../../api/axiosInstance";
import IotDeviceSensor from "../../entities/IotDeviceSensor";

interface DeviceSensors {
  [iot_device_id: number]: IotDeviceSensor[];
}

interface Props {
  companySlug?: string;
  username?: string;
}

function useGetIotDeviceSensor({ companySlug, username }: Props) {
  const axiosInstance = useAxios();

  const getIotDeviceSensor = () =>
    axiosInstance
      .get<DeviceSensors>("iot-device/device-sensors/all", {
        params: {
          company: companySlug,
          user: username,
        },
      })
      .then((res) => res.data);

  return useQuery<DeviceSensors, AxiosError>({
    queryKey: companySlug
      ? ["device-sensors", companySlug]
      : ["device-sensors", username],
    queryFn: getIotDeviceSensor,
  });
}

export default useGetIotDeviceSensor;
