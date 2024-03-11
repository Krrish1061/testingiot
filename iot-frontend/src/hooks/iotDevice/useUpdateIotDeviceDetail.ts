import useAxios from "../../api/axiosInstance";
import { useMutation } from "@tanstack/react-query";
import IotDeviceDetail from "../../entities/IotDeviceDetail";
import { IDeviceDetailFormInputs } from "../../components/iotDevice/zodSchema/IotDeviceDetailSchema";
import { AxiosError } from "axios";
import { enqueueSnackbar } from "notistack";

interface FormsInputs {
  device_id: number | undefined;
  device_detail: IDeviceDetailFormInputs;
}

function useUpdateIotDeviceDetail() {
  const axiosInstance = useAxios();

  const updateIotDeviceDetail = async ({
    device_id,
    device_detail,
  }: FormsInputs) =>
    axiosInstance
      .patch<IotDeviceDetail>(`iot-device/${device_id}/detail/`, device_detail)
      .then((res) => res.data);
  return useMutation<IotDeviceDetail, AxiosError, FormsInputs>({
    mutationFn: updateIotDeviceDetail,
    onSuccess: () => {
      enqueueSnackbar("Iot Device Detail's sucessfully Updated", {
        variant: "success",
      });
    },
    onError: () => {
      // reverting to the old rows here sensor is the sensor to be deleted
      enqueueSnackbar("Iot Device Detail's could not be Updated", {
        variant: "error",
      });
    },
  });
}

export default useUpdateIotDeviceDetail;
