import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useAxios from "../api/axiosInstance";
import User from "../entities/User";
import useAuthStore from "../store/authStore";
import { enqueueSnackbar } from "notistack";

function useEditUser() {
  const user = useAuthStore((state) => state.user);
  const axiosInstance = useAxios();

  const editUser = async (modifiedUser: User) => {
    return axiosInstance
      .patch<User>(
        `${user?.username}/${user?.id}/?user=${modifiedUser.username}`,
        modifiedUser
      )
      .then((res) => res.data);
  };

  return useMutation<User, AxiosError, User>({
    mutationFn: editUser,
    onSuccess: () => {
      enqueueSnackbar("User sucessfully Edited", { variant: "success" });
    },
    onError: () => {
      enqueueSnackbar("User Modification failed", { variant: "error" });
    },
  });
}

export default useEditUser;
