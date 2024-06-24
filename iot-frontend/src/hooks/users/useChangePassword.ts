import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { enqueueSnackbar } from "notistack";
import useAxios from "../../api/axiosInstance";
import useAuthStore from "../../store/authStore";

interface IFormInputs {
  old_password: string;
  new_password: string;
}

interface Response {
  message: string;
}

function useChangePassword() {
  const axiosInstance = useAxios();
  const user = useAuthStore((state) => state.user);

  const ChangePassword = async (data: IFormInputs) =>
    axiosInstance
      .post<Response>(`${user?.username}/change-password/`, data)
      .then((res) => res.data);

  return useMutation<Response, AxiosError<string[]>, IFormInputs>({
    mutationFn: ChangePassword,
    onSuccess: () => {
      enqueueSnackbar("Password Successfully Changed", {
        variant: "success",
      });
    },
    onError: (error) => {
      let errorMessage = "";
      if (error.code === "ERR_NETWORK") {
        errorMessage = error.message;
      } else {
        errorMessage = error.response?.data[0] || "Failed to Change Password";
      }
      enqueueSnackbar(errorMessage, {
        variant: "error",
      });
    },
  });
}

export default useChangePassword;
