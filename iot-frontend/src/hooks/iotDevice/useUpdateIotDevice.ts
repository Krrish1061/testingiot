import { useMutation } from "@tanstack/react-query";
import useAxios from "../../api/axiosInstance";
import { enqueueSnackbar } from "notistack";
import IotDevice from "../../entities/IotDevice";

function useUpdateIotDevice() {
  const axiosInstance = useAxios();

  const updateIotDevice = async (IotDevice: IotDevice) => {
    return axiosInstance
      .patch<IotDevice>(`iot-device/${IotDevice.id}/`, IotDevice)
      .then((res) => res.data);
  };

  return useMutation({
    mutationFn: updateIotDevice,
    onSuccess: () => {
      enqueueSnackbar("Iot Device sucessfully Updated", { variant: "success" });
    },
    onError: () => {
      // reverting to the old rows here sensor is the sensor to be deleted
      enqueueSnackbar("Iot Device could not be Updated", { variant: "error" });
    },
  });
}

export default useUpdateIotDevice;
