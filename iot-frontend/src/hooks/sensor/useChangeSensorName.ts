import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { enqueueSnackbar } from "notistack";
import useAxios from "../../api/axiosInstance";
import Sensor from "../../entities/Sensor";
import useSensorDataGridStore from "../../store/datagrid/sensorDataGridStore";

interface IFormInputs {
  sensor_name: string;
  new_name: string;
}

interface IError {
  error: string;
}

function useChangeSensorName() {
  const axiosInstance = useAxios();
  const rows = useSensorDataGridStore((state) => state.rows);
  const setRows = useSensorDataGridStore((state) => state.setRows);

  const changeSensorName = async (data: IFormInputs) => {
    return axiosInstance
      .post<Sensor>(`sensor/change-name/${data.sensor_name}/`, {
        sensor_name: data.new_name,
      })
      .then((res) => res.data);
  };

  return useMutation<Sensor, AxiosError<IError>, IFormInputs>({
    mutationFn: changeSensorName,
    onSuccess: (sensor) => {
      setRows([...rows, sensor]);
      enqueueSnackbar("Sensor Name Changed Sucessfully", {
        variant: "success",
      });
    },
    onError: (error) => {
      // reverting to the old rows here sensor is the sensor to be deleted
      enqueueSnackbar(error.response?.data.error, {
        variant: "error",
      });
    },
  });
}

export default useChangeSensorName;
