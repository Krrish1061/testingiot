import { useMutation } from "@tanstack/react-query";
import useAxios from "../../api/axiosInstance";
import useAuthStore from "../../store/authStore";
import { AxiosError } from "axios";
import { enqueueSnackbar } from "notistack";

interface IError {
  error: string;
}

interface IInputs {
  new_email: string;
}

interface IResponse {
  message: string;
}

function useChangeEmail() {
  const user = useAuthStore((state) => state.user);
  const axiosInstance = useAxios();

  const changeEmail = async (data: IInputs) =>
    axiosInstance
      .post<IResponse>(`${user?.username}/change-email/`, data)
      .then((res) => res.data);

  return useMutation<IResponse, AxiosError<IError>, IInputs>({
    mutationFn: changeEmail,
    onError: (error) => {
      let errorMessage = "";
      if (error.code === "ERR_NETWORK") {
        errorMessage = error.message;
      } else {
        errorMessage = error.response?.data.error || "Failed to Change Email";
      }
      enqueueSnackbar(errorMessage, {
        variant: "error",
      });
    },
  });
}

export default useChangeEmail;
