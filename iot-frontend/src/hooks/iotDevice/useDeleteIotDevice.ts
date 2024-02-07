import { useMutation } from "@tanstack/react-query";
import useAxios from "../../api/axiosInstance";
import { enqueueSnackbar } from "notistack";
import { AxiosError } from "axios";
import useIotDeviceDataGridStore from "../../store/datagrid/iotDeviceDataGridStore";
import IotDevice from "../../entities/IotDevice";

function useDeleteIotDevice() {
  const axiosInstance = useAxios();
  const rows = useIotDeviceDataGridStore((state) => state.rows);
  const setRows = useIotDeviceDataGridStore((state) => state.setRows);

  const deleteIotDevice = async (iotDevice: IotDevice) => {
    return axiosInstance.delete(`iot-device/${iotDevice.id}/`);
  };

  return useMutation({
    mutationFn: deleteIotDevice,
    onSuccess: () => {
      enqueueSnackbar("IotDevice sucessfully Deleted", { variant: "success" });
    },
    onError: (error: AxiosError, iotDevice) => {
      console.log(error);
      // reverting to the old rows here sensor is the sensor to be deleted
      setRows([...rows, iotDevice]);
      enqueueSnackbar("IotDevice Deletion failed", { variant: "error" });
    },
  });
}

export default useDeleteIotDevice;
