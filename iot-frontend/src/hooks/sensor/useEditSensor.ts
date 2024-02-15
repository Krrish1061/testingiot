import { useMutation } from "@tanstack/react-query";
import useAxios from "../../api/axiosInstance";
import { enqueueSnackbar } from "notistack";
import { AxiosError } from "axios";
import Sensor from "../../entities/Sensor";

function useEditSensor() {
  const axiosInstance = useAxios();

  const editSensor = async (sensor: Sensor) => {
    return axiosInstance
      .patch<Sensor>(`sensor/${sensor.name}/`, sensor)
      .then((res) => res.data);
  };

  return useMutation<Sensor, AxiosError, Sensor>({
    mutationFn: editSensor,
    onSuccess: () => {
      enqueueSnackbar("Sensor sucessfully Edited", { variant: "success" });
    },
    onError: () => {
      // reverting to the old rows here sensor is the sensor to be deleted
      enqueueSnackbar("Sensor modification failed", { variant: "error" });
    },
  });
}

export default useEditSensor;
