import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxios from "../../api/axiosInstance";
import { enqueueSnackbar } from "notistack";
import { AxiosError, AxiosResponse } from "axios";
import useIotDeviceDataGridStore from "../../store/datagrid/iotDeviceDataGridStore";
import IotDevice from "../../entities/IotDevice";

interface DeleteIotDeviceContext {
  previousIotDeviceList: IotDevice[];
}

interface IError {
  error: string;
}

function useDeleteIotDevice() {
  const axiosInstance = useAxios();
  const queryClient = useQueryClient();
  const rows = useIotDeviceDataGridStore((state) => state.rows);
  const setRows = useIotDeviceDataGridStore((state) => state.setRows);

  const deleteIotDevice = async (iotDevice: IotDevice) => {
    return axiosInstance.delete(`iot-device/${iotDevice.id}/`);
  };

  return useMutation<
    AxiosResponse,
    AxiosError<IError>,
    IotDevice,
    DeleteIotDeviceContext
  >({
    mutationFn: deleteIotDevice,
    onMutate: (deletingIotDevice) => {
      const previousIotDeviceList =
        queryClient.getQueryData<IotDevice[]>(["iotDeviceList"]) || [];

      queryClient.setQueryData<IotDevice[]>(
        ["iotDeviceList"],
        (iotDeviceList = []) =>
          iotDeviceList.filter(
            (iotDevice) => iotDevice.id !== deletingIotDevice.id
          )
      );

      return { previousIotDeviceList };
    },
    onSuccess: () => {
      enqueueSnackbar("IotDevice sucessfully Deleted", { variant: "success" });
    },
    onError: (error, iotDevice, context) => {
      // reverting to the old rows here sensor is the sensor to be deleted
      setRows([...rows, iotDevice]);
      let errorMessage = "";
      if (error.code === "ERR_NETWORK") {
        errorMessage = error.message;
      } else {
        errorMessage =
          error.response?.data.error || "IotDevice Deletion failed";
      }
      enqueueSnackbar(errorMessage, { variant: "error" });
      if (!context) return;
      queryClient.setQueryData<IotDevice[]>(
        ["iotDeviceList"],
        context.previousIotDeviceList
      );
    },
  });
}

export default useDeleteIotDevice;
