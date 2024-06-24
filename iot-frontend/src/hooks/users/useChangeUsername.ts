import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { enqueueSnackbar } from "notistack";
import useAxios from "../../api/axiosInstance";
import User from "../../entities/User";
import useAuthStore from "../../store/authStore";

interface IError {
  error: string;
}

interface IInputs {
  username: string;
}

function useChangeUsername() {
  const user = useAuthStore((state) => state.user);
  const axiosInstance = useAxios();

  const changeUsername = async (data: IInputs) =>
    axiosInstance
      .post<User>(`${user?.username}/change-username/`, data)
      .then((res) => res.data);

  return useMutation<User, AxiosError<IError>, IInputs>({
    mutationFn: changeUsername,
    onError: (error) => {
      enqueueSnackbar(error.response?.data.error, {
        variant: "error",
      });
    },
  });
}

export default useChangeUsername;
