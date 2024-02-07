import useAxios from "../../api/axiosInstance";
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";

function useDeleteDeviceSensor(iotDeviceId: number) {
  const axiosInstance = useAxios();

  const deleteIotDeviceSensors = (fieldNames: string[]) =>
    axiosInstance.delete(`iot-device/${iotDeviceId}/sensors/`, {
      data: { delete_fieldname_sensor: fieldNames },
    });

  return useMutation({
    mutationFn: deleteIotDeviceSensors,
    onSuccess: () => {
      enqueueSnackbar("Device field were sucessfully updated", {
        variant: "success",
      });
    },
    onError: () => {
      enqueueSnackbar("Erorr device sensor deletion failed", {
        variant: "error",
      });
    },
  });
}

export default useDeleteDeviceSensor;
