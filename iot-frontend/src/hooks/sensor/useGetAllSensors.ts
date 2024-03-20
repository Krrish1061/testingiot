import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useAxios from "../../api/axiosInstance";
import Sensor from "../../entities/Sensor";

function useGetAllSensors() {
  const axiosInstance = useAxios();

  const fetchSensors = () =>
    axiosInstance.get<Sensor[]>("sensor/all/").then((res) => res.data);

  return useQuery<Sensor[], AxiosError>({
    queryKey: ["sensorList"],
    queryFn: fetchSensors,
    cacheTime: Infinity,
    staleTime: Infinity,
  });
}

export default useGetAllSensors;
