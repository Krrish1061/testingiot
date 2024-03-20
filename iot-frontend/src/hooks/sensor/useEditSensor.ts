import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxios from "../../api/axiosInstance";
import { enqueueSnackbar } from "notistack";
import { AxiosError } from "axios";
import Sensor from "../../entities/Sensor";

interface EditSensorContext {
  previousSensorList: Sensor[];
}

interface IError {
  error: string;
  errors: string[];
}

function useEditSensor() {
  const axiosInstance = useAxios();
  const queryClient = useQueryClient();
  const editSensor = async (sensor: Sensor) => {
    return axiosInstance
      .patch<Sensor>(`sensor/${sensor.name}/`, sensor)
      .then((res) => res.data);
  };

  return useMutation<Sensor, AxiosError<IError>, Sensor, EditSensorContext>({
    mutationFn: editSensor,
    onMutate: (editingSensor) => {
      const previousSensorList =
        queryClient.getQueryData<Sensor[]>(["sensorList"]) || [];

      queryClient.setQueryData<Sensor[]>(["sensorList"], (sensors = []) =>
        sensors.map((sensor) =>
          sensor.name === editingSensor.name ? editingSensor : sensor
        )
      );

      return { previousSensorList };
    },
    onSuccess: (newSensor) => {
      enqueueSnackbar("Sensor sucessfully Edited", { variant: "success" });
      queryClient.setQueryData<Sensor[]>(["sensorList"], (sensors) =>
        sensors?.map((sensor) =>
          sensor.name === newSensor.name ? newSensor : sensor
        )
      );
    },
    onError: (error, _sensor, context) => {
      // reverting to the old rows here sensor is the sensor to be deleted
      let errorMessage = "";
      if (error.code === "ERR_NETWORK") {
        errorMessage = error.message;
      } else {
        errorMessage =
          error.response?.data.error ||
          (error.response?.data.errors && error.response?.data.errors[0]) ||
          "Failed to Edit Sensor";
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

export default useEditSensor;
