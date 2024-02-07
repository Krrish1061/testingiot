import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import User from "../../entities/User";
import useAxios from "../../api/axiosInstance";
import useAuthStore from "../../store/authStore";
import { enqueueSnackbar } from "notistack";

interface IFormInputs {
  email: string;
  type: "ADMIN" | "MODERATOR" | "VIEWER";
  company?: string | null | undefined;
}

const useAddUser = () => {
  const axiosInstance = useAxios();
  const user = useAuthStore((state) => state.user);

  const postUser = (data: IFormInputs) =>
    axiosInstance
      .post<User>(`${user?.username}/add/user/`, data)
      .then((res) => res.data);

  return useMutation<User, AxiosError, IFormInputs>({
    mutationFn: postUser,
    onSuccess: () => {
      enqueueSnackbar("User Successfully added", {
        variant: "success",
      });
    },
  });
};

export default useAddUser;
