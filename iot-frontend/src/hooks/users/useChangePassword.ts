import useAuthStore from "../../store/authStore";
import useAxios from "../../api/axiosInstance";
import { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";

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

  return useMutation<Response, AxiosError<Array<string>>, IFormInputs>({
    mutationFn: ChangePassword,
    onError: (error) => {
      enqueueSnackbar(error.response?.data[0], {
        variant: "error",
      });
    },
  });
}

export default useChangePassword;
