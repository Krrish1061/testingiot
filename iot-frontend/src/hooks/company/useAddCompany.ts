import { AxiosError } from "axios";
import useAxios from "../../api/axiosInstance";
import Company from "../../entities/Company";
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";

interface IFormInputs {
  email: string;
  name: string;
  user_limit: number;
}

interface IError {
  error: string;
}

function useAddCompany() {
  const axiosInstance = useAxios();

  const addCompany = async (data: IFormInputs) =>
    axiosInstance.post<Company>("company/", data).then((res) => res.data);

  return useMutation<Company, AxiosError<IError>, IFormInputs>({
    mutationFn: addCompany,
    onSuccess: () => {
      enqueueSnackbar("Company sucessfully Created", { variant: "success" });
    },
    onError: (error) => {
      enqueueSnackbar(error.response?.data.error, {
        variant: "error",
      });
    },
  });
}

export default useAddCompany;
