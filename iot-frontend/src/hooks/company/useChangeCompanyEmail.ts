import { useMutation } from "@tanstack/react-query";

import { AxiosError } from "axios";
import { enqueueSnackbar } from "notistack";
import useCompanyStore from "../../store/companyStore";
import useAxios from "../../api/axiosInstance";

interface IError {
  error: string;
}

interface IInputs {
  new_email: string;
}

interface IResponse {
  message: string;
}

function useChangeCompanyEmail() {
  const company = useCompanyStore((state) => state.company);
  const axiosInstance = useAxios();

  const changeEmail = async (data: IInputs) =>
    axiosInstance
      .post<IResponse>(`company/${company.slug}/change-email/`, data)
      .then((res) => res.data);

  return useMutation<IResponse, AxiosError<IError>, IInputs>({
    mutationFn: changeEmail,
    onError: (error) => {
      enqueueSnackbar(error.response?.data.error, {
        variant: "error",
      });
    },
  });
}

export default useChangeCompanyEmail;
