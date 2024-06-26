import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxios from "../../api/axiosInstance";
import { enqueueSnackbar } from "notistack";
import { AxiosError, AxiosResponse } from "axios";
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
    onError: (error, _iotDevice, context) => {
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
