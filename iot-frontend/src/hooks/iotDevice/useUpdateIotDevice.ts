import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { enqueueSnackbar } from "notistack";
import useAxios from "../../api/axiosInstance";
import IotDevice from "../../entities/IotDevice";

interface EditIotDeviceContext {
  previousIotDeviceList: IotDevice[];
}

interface IError {
  error: string;
  errors: string[];
}

function useUpdateIotDevice() {
  const axiosInstance = useAxios();
  const queryClient = useQueryClient();

  const updateIotDevice = async (IotDevice: IotDevice) =>
    axiosInstance
      .patch<IotDevice>(`iot-device/${IotDevice.id}/`, IotDevice)
      .then((res) => res.data);

  return useMutation<
    IotDevice,
    AxiosError<IError>,
    IotDevice,
    EditIotDeviceContext
  >({
    mutationFn: updateIotDevice,
    onMutate: (editingIotDevice) => {
      const previousIotDeviceList =
        queryClient.getQueryData<IotDevice[]>(["iotDeviceList"]) || [];

      queryClient.setQueryData<IotDevice[]>(
        ["iotDeviceList"],
        (iotDeviceList) =>
          iotDeviceList?.map((iotDevice) =>
            iotDevice.id === editingIotDevice.id ? editingIotDevice : iotDevice
          )
      );

      return { previousIotDeviceList };
    },
    onSuccess: (newIotDevice) => {
      enqueueSnackbar("Iot Device sucessfully Updated", { variant: "success" });
      queryClient.setQueryData<IotDevice[]>(
        ["iotDeviceList"],
        (iotDeviceList) =>
          iotDeviceList?.map((iotDevice) =>
            iotDevice.id === newIotDevice.id ? newIotDevice : iotDevice
          )
      );
    },
    onError: (error, _iotDevice, context) => {
      let errorMessage = "";
      if (error.code === "ERR_NETWORK") {
        errorMessage = error.message;
      } else {
        errorMessage =
          error.response?.data.error ||
          (error.response?.data.errors && error.response?.data.errors[0]) ||
          "Failed to Edit IotDevice";
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

export default useUpdateIotDevice;
