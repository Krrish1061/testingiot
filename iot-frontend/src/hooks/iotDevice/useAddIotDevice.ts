import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useAxios from "../../api/axiosInstance";
import { enqueueSnackbar } from "notistack";
import IotDevice from "../../entities/IotDevice";
import { IDeviceFormInputs } from "../../components/iotDevice/zodSchema/IotDeviceSchema";

// interface IFormInputs {
//   user?: string | null | undefined;
//   company?: string | null | undefined;
//   board_id?: number | null | undefined;
//   iot_device_location: string;
// }

interface IError {
  error: string;
  board_id?: string[];
}

function useAddIotDevice() {
  const axiosInstance = useAxios();

  const addIotDevice = (data: IDeviceFormInputs) =>
    axiosInstance
      .post<IotDevice>("iot-device/add/", data)
      .then((res) => res.data);

  return useMutation<IotDevice, AxiosError<IError>, IDeviceFormInputs>({
    mutationFn: addIotDevice,
    onSuccess: () => {
      enqueueSnackbar("Iot Device sucessfully Added", { variant: "success" });
    },
    onError: (error) => {
      if (error.response?.data?.board_id) {
        enqueueSnackbar(error.response.data.board_id[0], {
          variant: "error",
        });
      } else {
        enqueueSnackbar(error.response?.data.error, {
          variant: "error",
        });
      }
    },
  });
}

export default useAddIotDevice;
