import { useMutation } from "@tanstack/react-query";
import useAxios from "../../api/axiosInstance";
import { enqueueSnackbar } from "notistack";
import { AxiosError } from "axios";
import useSensorDataGridStore from "../../store/datagrid/sensorDataGridStore";
import Sensor from "../../entities/Sensor";

function useDeleteSensor() {
  const axiosInstance = useAxios();
  const rows = useSensorDataGridStore((state) => state.rows);
  const setRows = useSensorDataGridStore((state) => state.setRows);

  const deleteSensor = async (sensor: Sensor) => {
    return axiosInstance.delete(`sensor/${sensor.name}/`);
  };

  return useMutation({
    mutationFn: deleteSensor,
    onSuccess: () => {
      enqueueSnackbar("Sensor sucessfully Deleted", { variant: "success" });
    },
    onError: (_error: AxiosError, sensor) => {
      // reverting to the old rows here sensor is the sensor to be deleted
      setRows([...rows, sensor]);
      enqueueSnackbar("Sensor Deletion failed", { variant: "error" });
    },
  });
}

export default useDeleteSensor;
