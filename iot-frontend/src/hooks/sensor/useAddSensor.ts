import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useAxios from "../../api/axiosInstance";
import Sensor from "../../entities/Sensor";
import { enqueueSnackbar } from "notistack";

interface IFormInputs {
  name: string;
  unit?: string | null;
  symbol?: string | null;
  is_value_boolean: boolean;
  max_limit?: number | null;
  min_limit?: number | null;
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
