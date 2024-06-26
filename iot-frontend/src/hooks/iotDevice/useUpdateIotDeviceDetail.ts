import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { enqueueSnackbar } from "notistack";
import useAxios from "../../api/axiosInstance";
import { IDeviceDetailFormInputs } from "../../components/iotDevice/zodSchema/IotDeviceDetailSchema";
import IotDevice from "../../entities/IotDevice";
import IotDeviceDetail from "../../entities/IotDeviceDetail";
import useIotDeviceDataGridStore from "../../store/datagrid/iotDeviceDataGridStore";

interface FormsInputs {
  device_id: number | undefined;
  device_detail: IDeviceDetailFormInputs;
}

interface UpdateIotDeviceDetailContext {
  previousIotDeviceList: IotDevice[];
}

interface IError {
  error: string;
  name?: string[];
}

function useUpdateIotDeviceDetail() {
  const axiosInstance = useAxios();
  const queryClient = useQueryClient();
  const rows = useIotDeviceDataGridStore((state) => state.rows);
  const setRows = useIotDeviceDataGridStore((state) => state.setRows);

  const updateIotDeviceDetail = async ({
    device_id,
    device_detail,
  }: FormsInputs) =>
    axiosInstance
      .patch<IotDeviceDetail>(`iot-device/${device_id}/detail/`, device_detail)
      .then((res) => res.data);

  return useMutation<
    IotDeviceDetail,
    AxiosError<IError>,
    FormsInputs,
    UpdateIotDeviceDetailContext
  >({
    mutationFn: updateIotDeviceDetail,
    onMutate: ({ device_id, device_detail }) => {
      const previousIotDeviceList =
        queryClient.getQueryData<IotDevice[]>(["iotDeviceList"]) || [];

      if (device_id) {
        queryClient.setQueryData<IotDevice[]>(
          ["iotDeviceList"],
          (iotDeviceList) =>
            iotDeviceList?.map((iotDevice) =>
              iotDevice.id === device_id
                ? {
                    ...iotDevice,
                    iot_device_details: device_detail as IotDeviceDetail,
                  }
                : iotDevice
            )
        );
      }

      return { previousIotDeviceList };
    },
    onSuccess: (newIotDeviceDetail, { device_id }) => {
      enqueueSnackbar("Iot Device Detail's sucessfully Updated", {
        variant: "success",
      });
      if (rows.length !== 0) {
        const newRows = rows.map((row) =>
          row.id === device_id
            ? { ...row, iot_device_details: newIotDeviceDetail }
            : row
        );
        setRows(newRows);
      }
    },
    onError: (error, _iotDevice, context) => {
      let errorMessage = "";
      if (error.code === "ERR_NETWORK") {
        errorMessage = error.message;
      } else {
        errorMessage =
          error.response?.data.error ||
          (error.response?.data.name && error.response.data.name[0]) ||
          "Iot Device Detail's could not be Updated";
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

export default useUpdateIotDeviceDetail;
