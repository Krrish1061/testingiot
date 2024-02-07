import { useQuery } from "@tanstack/react-query";
import useAxios from "../../api/axiosInstance";
import IotDevice from "../../entities/IotDevice";
import { AxiosError } from "axios";

function useGetAllIotDevice() {
  const axiosInstance = useAxios();

  const fetchIotDevices = () =>
    axiosInstance.get<IotDevice[]>("iot-device/all/").then((res) => res.data);

  return useQuery<IotDevice[], AxiosError>({
    queryKey: ["iotDeviceList"],
    queryFn: fetchIotDevices,
  });
}

export default useGetAllIotDevice;
