import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { enqueueSnackbar } from "notistack";
import useAxios from "../../api/axiosInstance";
import Sensor from "../../entities/Sensor";

interface IFormInputs {
  sensor_name: string;
  new_name: string;
}

interface IError {
  error: string;
}

interface ChangeSensorNameContext {
  previousSensorList: Sensor[];
}

function useChangeSensorName() {
  const axiosInstance = useAxios();
  const queryClient = useQueryClient();

  const changeSensorName = async (data: IFormInputs) => {
    return axiosInstance
      .post<Sensor>(`sensor/change-name/${data.sensor_name}/`, {
        sensor_name: data.new_name,
      })
      .then((res) => res.data);
  };

  return useMutation<
    Sensor,
    AxiosError<IError>,
    IFormInputs,
    ChangeSensorNameContext
  >({
    mutationFn: changeSensorName,
    onMutate: (formInputs) => {
      const previousSensorList =
        queryClient.getQueryData<Sensor[]>(["sensorList"]) || [];

      queryClient.setQueryData<Sensor[]>(["sensorList"], (sensors = []) =>
        sensors.map((sensor) =>
          sensor.name === formInputs.sensor_name
            ? { ...sensor, name: formInputs.new_name }
            : sensor
        )
      );

      return { previousSensorList };
    },
    onSuccess: () => {
      enqueueSnackbar("Sensor Name Changed Sucessfully", {
        variant: "success",
      });
      queryClient.invalidateQueries({
        queryKey: ["device-sensors"],
      });
    },
    onError: (error, _formsInputs, context) => {
      let errorMessage = "";
      if (error.code === "ERR_NETWORK") {
        errorMessage = error.message;
      } else {
        errorMessage =
          error.response?.data.error || "Failed to Change Sensor Name";
      }
      enqueueSnackbar(errorMessage, {
        variant: "error",
      });
      if (!context) return;
      queryClient.setQueryData<Sensor[]>(
        ["sensorList"],
        context.previousSensorList
      );
    },
  });
}

export default useChangeSensorName;
