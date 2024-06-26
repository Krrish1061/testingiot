import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { enqueueSnackbar } from "notistack";
import useAxios from "../../api/axiosInstance";
import Sensor from "../../entities/Sensor";

interface DeleteSensorContext {
  previousSensorList: Sensor[];
}

interface IError {
  error: string;
}

function useDeleteSensor() {
  const axiosInstance = useAxios();
  const queryClient = useQueryClient();

  const deleteSensor = async (sensor: Sensor) => {
    return axiosInstance.delete(`sensor/${sensor.name}/`);
  };

  return useMutation<
    AxiosResponse,
    AxiosError<IError>,
    Sensor,
    DeleteSensorContext
  >({
    mutationFn: deleteSensor,
    onMutate: (deletingSensor) => {
      const previousSensorList =
        queryClient.getQueryData<Sensor[]>(["sensorList"]) || [];

      queryClient.setQueryData<Sensor[]>(["sensorList"], (sensors = []) =>
        sensors.filter((sensor) => sensor.id !== deletingSensor.id)
      );

      return { previousSensorList };
    },
    onSuccess: () => {
      enqueueSnackbar("Sensor sucessfully Deleted", { variant: "success" });
    },
    onError: (error, _sensor, context) => {
      let errorMessage = "";
      if (error.code === "ERR_NETWORK") {
        errorMessage = error.message;
      } else {
        errorMessage = error.response?.data.error || "Sensor Deletion failed";
      }
      enqueueSnackbar(errorMessage, { variant: "error" });
      if (!context) return;
      queryClient.setQueryData<Sensor[]>(
        ["sensorList"],
        context.previousSensorList
      );
    },
  });
}

export default useDeleteSensor;
