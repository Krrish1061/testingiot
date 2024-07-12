import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import useAxios from "../../api/axiosInstance";
import useAuthStore from "../../store/authStore";
import resetAllStore from "../../store/resetAllStore";

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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const ChangePassword = async (data: IFormInputs) =>
    axiosInstance
      .post<Response>(`${user?.username}/change-password/`, data)
      .then((res) => res.data);

  return useMutation<Response, AxiosError<string[]>, IFormInputs>({
    mutationFn: ChangePassword,
    onSuccess: () => {
      resetAllStore();
      queryClient.clear();
      enqueueSnackbar("Password Successfully Changed", {
        variant: "success",
      });
      navigate("/login");
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
