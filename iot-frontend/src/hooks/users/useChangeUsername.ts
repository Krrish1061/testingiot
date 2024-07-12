import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import useAxios from "../../api/axiosInstance";
import useAuthStore from "../../store/authStore";
import resetAllStore from "../../store/resetAllStore";

interface IError {
  error: string;
}

interface IInputs {
  username: string;
}

interface IResponse {
  message: string;
}

function useChangeUsername() {
  const user = useAuthStore((state) => state.user);
  const axiosInstance = useAxios();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const changeUsername = async (data: IInputs) =>
    axiosInstance
      .post<IResponse>(`${user?.username}/change-username/`, data)
      .then((res) => res.data);

  return useMutation<IResponse, AxiosError<IError>, IInputs>({
    mutationFn: changeUsername,
    onSuccess: (response) => {
      resetAllStore();
      queryClient.clear();
      enqueueSnackbar(response.message, { variant: "success" });
      navigate("/login");
    },
    onError: (error) => {
      enqueueSnackbar(error.response?.data.error, {
        variant: "error",
      });
    },
  });
}

export default useChangeUsername;
