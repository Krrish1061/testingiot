import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { enqueueSnackbar } from "notistack";
import useAxios from "../../api/axiosInstance";
import { IDeviceFormInputs } from "../../components/iotDevice/zodSchema/IotDeviceSchema";
import IotDevice from "../../entities/IotDevice";

interface IError {
  error?: string;
  errors?: string[];
  board_id?: string[];
}

interface AddIotDeviceContext {
  previousIotDeviceList: IotDevice[];
  newIotDeviceId: number;
}

function useAddIotDevice() {
  const axiosInstance = useAxios();
  const queryClient = useQueryClient();

  const addIotDevice = (data: IDeviceFormInputs) =>
    axiosInstance
      .post<IotDevice>("iot-device/add/", data)
      .then((res) => res.data);

  return useMutation<
    IotDevice,
    AxiosError<IError>,
    IDeviceFormInputs,
    AddIotDeviceContext
  >({
    mutationFn: addIotDevice,
    onMutate: (formInputs: IDeviceFormInputs) => {
      const previousIotDeviceList =
        queryClient.getQueryData<IotDevice[]>(["iotDeviceList"]) || [];

      const newIotDeviceId = Math.floor(Math.random() * 9000) + 1000;

      const newIotDevice: IotDevice = {
        ...formInputs,
        id: newIotDeviceId,
        created_at: new Date(),
        iot_device_details: {
          name: null,
          environment_type: null,
          address: null,
          description: null,
        },
        sensor_name_list: [],
      };

      queryClient.setQueryData<IotDevice[]>(
        ["iotDeviceList"],
        (iotDeviceList = []) => [...iotDeviceList, newIotDevice]
      );

      return { previousIotDeviceList, newIotDeviceId };
    },
    onSuccess: (newIotDevice, _formsInputs, context) => {
      enqueueSnackbar("Iot Device sucessfully Added", { variant: "success" });
      if (!context) return;
      queryClient.setQueryData<IotDevice[]>(
        ["iotDeviceList"],
        (iotDeviceList) =>
          iotDeviceList?.map((iotDevice) =>
            iotDevice.id === context.newIotDeviceId ? newIotDevice : iotDevice
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
          (error.response?.data.errors && error.response.data.errors[0]) ||
          (error.response?.data.board_id && error.response.data.board_id[0]) ||
          "Failed to Create IotDevice";
      }
      enqueueSnackbar(errorMessage, {
        variant: "error",
      });
      if (!context) return;
      queryClient.setQueryData<IotDevice[]>(
        ["iotDeviceList"],
        context.previousIotDeviceList
      );
    },
  });
}

export default useAddIotDevice;
