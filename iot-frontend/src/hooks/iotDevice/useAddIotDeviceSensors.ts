import useAxios from "../../api/axiosInstance";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { enqueueSnackbar } from "notistack";

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

interface IResponse {
  message: string;
}

function useAddIotDeviceSensors(iotDeviceId: number) {
  const axiosInstance = useAxios();

  const addIotDeviceSensors = (data: IFormInputs) =>
    axiosInstance
      .post<IResponse>(`iot-device/${iotDeviceId}/sensors/`, {
        fieldname_sensor: data,
      })
      .then((res) => res.data);

  return useMutation<IResponse, AxiosError<IError>, IFormInputs>({
    mutationFn: addIotDeviceSensors,
    onSuccess: () => {
      enqueueSnackbar("Sensors were sucessfully associated with the device", {
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

export default useAddIotDeviceSensors;
