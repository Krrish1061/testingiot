import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { enqueueSnackbar } from "notistack";
import useAxios from "../../api/axiosInstance";
import User from "../../entities/User";
import useAuthStore from "../../store/authStore";

interface DeleteUserContext {
  previousUserList: User[];
}

interface IError {
  error: string;
}

function useDeleteUser() {
  const axiosInstance = useAxios();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const deleteUser = async (modifiedUser: User) =>
    axiosInstance.delete(`${user?.username}/?user=${modifiedUser.username}`);

  return useMutation<
    AxiosResponse,
    AxiosError<IError>,
    User,
    DeleteUserContext
  >({
    mutationFn: deleteUser,
    onMutate: (deletingUser) => {
      const previousUserList =
        queryClient.getQueryData<User[]>(["userList"]) || [];

      queryClient.setQueryData<User[]>(["userList"], (user = []) =>
        user.filter((user) => user.username !== deletingUser.username)
      );

      return { previousUserList };
    },
    onSuccess: () => {
      enqueueSnackbar("User sucessfull Deleted", { variant: "success" });
    },
    onError: (error, _user, context) => {
      let errorMessage = "";
      if (error.code === "ERR_NETWORK") {
        errorMessage = error.message;
      } else {
        errorMessage = error.response?.data.error || "User Deletion failed";
      }
      enqueueSnackbar(errorMessage, { variant: "error" });
      if (!context) return;
      queryClient.setQueryData<User[]>(["userList"], context.previousUserList);
    },
  });
}

export default useDeleteUser;
