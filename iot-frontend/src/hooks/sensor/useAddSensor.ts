import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useAxios from "../../api/axiosInstance";
import Sensor from "../../entities/Sensor";
import { enqueueSnackbar } from "notistack";
import useSensorDataGridStore from "../../store/datagrid/sensorDataGridStore";

interface IFormInputs {
  name: string;
  unit?: string | null;
  symbol?: string | null;
  is_value_boolean: boolean;
  max_limit?: number | null;
  min_limit?: number | null;
}

interface IError {
  error?: string;
  name?: string[];
}

interface AddSensorContext {
  previousSensorList: Sensor[];
  newSensorId: number;
}

const useAddSensor = () => {
  const axiosInstance = useAxios();
  const queryClient = useQueryClient();
  const rows = useSensorDataGridStore((state) => state.rows);
  const setRows = useSensorDataGridStore((state) => state.setRows);

  const addSensor = (data: IFormInputs) =>
    axiosInstance.post<Sensor>("sensor/add/", data).then((res) => res.data);

  return useMutation<Sensor, AxiosError<IError>, IFormInputs, AddSensorContext>(
    {
      mutationFn: addSensor,
      onMutate: (formInputs: IFormInputs) => {
        const previousSensorList =
          queryClient.getQueryData<Sensor[]>(["sensorList"]) || [];

        const newSensorId = Math.floor(Math.random() * 9000) + 1000;

        const newSensor = {
          ...formInputs,
          id: newSensorId,
          created_at: new Date(),
        } as Sensor;

        queryClient.setQueryData<Sensor[]>(["sensorList"], (sensors = []) => [
          ...sensors,
          newSensor,
        ]);

        return { previousSensorList, newSensorId };
      },
      onSuccess: (newSensor, _formsInputs, context) => {
        enqueueSnackbar("Sensor sucessfully Created", { variant: "success" });
        if (rows.length !== 0) setRows([...rows, newSensor]);
        if (!context) return;
        queryClient.setQueryData<Sensor[]>(["sensorList"], (sensors) =>
          sensors?.map((sensor) =>
            sensor.id === context.newSensorId ? newSensor : sensor
          )
        );
      },
      onError: (error, _formsInputs, context) => {
        let errorMessage = "";
        if (error.code === "ERR_NETWORK") {
          errorMessage = error.message;
        } else {
          errorMessage =
            error.response?.data.error ||
            (error.response?.data.name && error.response.data.name[0]) ||
            "Failed to Create Sensor";
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
    }
  );
};

export default useAddSensor;
