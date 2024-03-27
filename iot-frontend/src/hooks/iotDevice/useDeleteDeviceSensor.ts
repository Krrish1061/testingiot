import useAxios from "../../api/axiosInstance";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { enqueueSnackbar } from "notistack";
import { useParams } from "react-router-dom";

interface IError {
  error: string;
}

function useDeleteDeviceSensor(iotDeviceId: number) {
  const { username, companySlug } = useParams();
  const axiosInstance = useAxios();
  const queryClient = useQueryClient();

  const deleteIotDeviceSensors = (fieldNames: string[]) =>
    axiosInstance.delete(`iot-device/${iotDeviceId}/sensors/`, {
      data: { delete_fieldname_sensor: fieldNames },
    });

  return useMutation<AxiosResponse, AxiosError<IError>, string[]>({
    mutationFn: deleteIotDeviceSensors,
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
          "Failed to Delete Associate Sensor of IotDevice";
      }
      enqueueSnackbar(errorMessage, {
        variant: "error",
      });
    },
  });
}

export default useDeleteDeviceSensor;
