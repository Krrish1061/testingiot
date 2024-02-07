import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useAxios from "../../api/axiosInstance";
import IotDeviceSensor from "../../entities/IotDeviceSensor";

interface DeviceSensors {
  [iot_device_id: number]: IotDeviceSensor[];
}

function useGetIotDeviceSensor(company_slug: string = "") {
  const axiosInstance = useAxios();

  const getIotDeviceSensor = () =>
    axiosInstance
      .get<DeviceSensors>(`iot-device/${company_slug}/all/device-sensors/`)
      .then((res) => res.data);

  return useQuery<DeviceSensors, AxiosError>({
    queryKey: [`${company_slug}-device-sensors`],
    queryFn: getIotDeviceSensor,
  });
}

export default useGetIotDeviceSensor;
