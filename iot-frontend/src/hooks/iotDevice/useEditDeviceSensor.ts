import useAxios from "../../api/axiosInstance";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { enqueueSnackbar } from "notistack";
import IotDeviceSensor from "../../entities/IotDeviceSensor";
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

function useEditDeviceSensors(iotDeviceId: number) {
  const { username, companySlug } = useParams();
  const axiosInstance = useAxios();
  const queryClient = useQueryClient();

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
          "Failed to Edit Associate Sensor of IotDevice";
      }
      enqueueSnackbar(errorMessage, {
        variant: "error",
      });
    },
  });
}

export default useEditDeviceSensors;
