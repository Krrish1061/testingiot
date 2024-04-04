import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useAxios from "../../api/axiosInstance";
import { enqueueSnackbar } from "notistack";
import IotDevice from "../../entities/IotDevice";
import { IDeviceFormInputs } from "../../components/iotDevice/zodSchema/IotDeviceSchema";
import useIotDeviceDataGridStore from "../../store/datagrid/iotDeviceDataGridStore";

interface IError {
  error: string;
  board_id?: string[];
}

interface AddIotDeviceContext {
  previousIotDeviceList: IotDevice[];
  newIotDeviceId: number;
}

function useAddIotDevice() {
  const axiosInstance = useAxios();
  const queryClient = useQueryClient();
  const rows = useIotDeviceDataGridStore((state) => state.rows);
  const setRows = useIotDeviceDataGridStore((state) => state.setRows);

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
      if (rows.length !== 0) setRows([...rows, newIotDevice]);
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
