import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { enqueueSnackbar } from "notistack";
import useAxios from "../../api/axiosInstance";

interface IError {
  error: string;
}

interface IInputs {
  user?: string | null | undefined;
  company?: string | null | undefined;
  dealer?: string | null | undefined;
}

interface IResponse {
  message: string;
}

function useReSendSetPasswordEmail() {
  const axiosInstance = useAxios();

  const reSendEmail = async (data: IInputs) =>
    axiosInstance
      .post<IResponse>("account/resend-set-password-email/", data)
      .then((res) => res.data);

  return useMutation<IResponse, AxiosError<IError>, IInputs>({
    mutationFn: reSendEmail,
    onSuccess: (response) =>
      enqueueSnackbar(response.message, {
        variant: "success",
      }),
    onError: (error) =>
      enqueueSnackbar(error.response?.data.error, {
        variant: "error",
      }),
  });
}

export default useReSendSetPasswordEmail;
