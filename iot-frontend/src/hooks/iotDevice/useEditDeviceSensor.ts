import useAxios from "../../api/axiosInstance";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { enqueueSnackbar } from "notistack";
import IotDeviceSensor from "../../entities/IotDeviceSensor";

interface ISensorField {
  sensor_name: string;
  max_limit: number | null;
  min_limit: number | null;
}

interface IFormInputs {
  [field_name: string]: ISensorField;
}

interface IError {
  error: string;
}

function useEditDeviceSensors(iotDeviceId: number) {
  const axiosInstance = useAxios();

  const editIotDeviceSensors = (data: IFormInputs) =>
    axiosInstance
      .patch<IotDeviceSensor[]>(`iot-device/${iotDeviceId}/sensors/`, {
        update_fieldname_sensor: data,
      })
      .then((res) => res.data);

  return useMutation<IotDeviceSensor[], AxiosError<IError>, IFormInputs>({
    mutationFn: editIotDeviceSensors,
    onSuccess: () => {
      enqueueSnackbar("Device field were sucessfully updated", {
        variant: "success",
      });
    },
    onError: (error) => {
      enqueueSnackbar(error.response?.data.error, {
        variant: "error",
      });
    },
  });
}

export default useEditDeviceSensors;
