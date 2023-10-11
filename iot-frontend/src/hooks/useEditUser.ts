import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useAxios from "../api/axiosInstance";
import User from "../entities/User";
import useAuthStore from "../store/authStore";
import { enqueueSnackbar } from "notistack";

function useEditUser() {
  const user = useAuthStore((state) => state.user);
  const axiosInstance = useAxios();

  const editUser = (modifiedUser: User) => {
    // console.log("in hook", modifiedUser);

    return axiosInstance
      .patch<User>(
        `${user?.username}/${user?.id}/?user=${modifiedUser.username}x`,
        modifiedUser
      )
      .then((res) => res.data);
  };

  return useMutation<User, AxiosError, User>({
    mutationFn: editUser,
    onSuccess: () => {
      enqueueSnackbar("User sucessfull Edited", { variant: "success" });
    },
    onError: () => {
      enqueueSnackbar("UserModification failed", { variant: "error" });
    },
  });
}

export default useEditUser;
