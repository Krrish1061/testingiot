import { useMutation } from "@tanstack/react-query";
import useAxios from "../../api/axiosInstance";
import useAuthStore from "../../store/authStore";
import { AxiosError } from "axios";
import { enqueueSnackbar } from "notistack";
import User from "../../entities/User";

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
  const setUser = useAuthStore((state) => state.setUser);
  const axiosInstance = useAxios();

  const changeUsername = async (data: IInputs) =>
    axiosInstance
      .post<IResponse>(`${user?.username}/change-username/`, data)
      .then((res) => res.data);

  return useMutation<IResponse, AxiosError<IError>, IInputs>({
    mutationFn: changeUsername,
    onSuccess: (_message, inputs) => {
      setUser({ ...user, username: inputs.username } as User);
    },
    onError: (error) => {
      enqueueSnackbar(error.response?.data.error, {
        variant: "error",
      });
    },
  });
}

export default useChangeUsername;
