import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useAxios from "../../api/axiosInstance";
import Sensor from "../../entities/Sensor";
import { enqueueSnackbar } from "notistack";

interface IFormInputs {
  name: string;
  unit: string;
  symbol?: string | null;
  max_value?: number | null;
  min_value?: number | null;
}

interface IError {
  error: string;
}

const useAddSensor = () => {
  const axiosInstance = useAxios();

  const addSensor = (data: IFormInputs) =>
    axiosInstance.post<Sensor>("sensor/add/", data).then((res) => res.data);

  return useMutation<Sensor, AxiosError<IError>, IFormInputs>({
    mutationFn: addSensor,
    onSuccess: () => {
      enqueueSnackbar("Sensor sucessfully Created", { variant: "success" });
    },
    onError: (error) => {
      enqueueSnackbar(error.response?.data.error, {
        variant: "error",
      });
    },
  });
};

export default useAddSensor;
