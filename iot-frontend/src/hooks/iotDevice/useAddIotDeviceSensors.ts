import useAxios from "../../api/axiosInstance";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { enqueueSnackbar } from "notistack";
import { useParams } from "react-router-dom";

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
  const { username, companySlug } = useParams();
  const axiosInstance = useAxios();
  const queryClient = useQueryClient();

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
      queryClient.invalidateQueries({
        queryKey: ["device-sensors", username || companySlug],
      });
    },
    onError: (error) => {
      let errorMessage = "";
      if (error.code === "ERR_NETWORK") {
        errorMessage = error.message;
      } else {
        errorMessage =
          error.response?.data.error ||
          "Failed to Associate Sensor to IotDevice";
      }
      enqueueSnackbar(errorMessage, {
        variant: "error",
      });
    },
  });
}

export default useAddIotDeviceSensors;
