import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useAxios from "../../api/axiosInstance";
import useAuthStore from "../../store/authStore";
import { enqueueSnackbar } from "notistack";
import User from "../../entities/User";
import useUserDataGridStore from "../../store/datagrid/userDataGridStore";

interface DeleteUserContext {
  previousUserList: User[];
}

interface IError {
  error: string;
}

function useDeleteUser() {
  const axiosInstance = useAxios();
  const user = useAuthStore((state) => state.user);
  const rows = useUserDataGridStore((state) => state.rows);
  const setRows = useUserDataGridStore((state) => state.setRows);
  const queryClient = useQueryClient();

  const deleteUser = async (modifiedUser: User) =>
    axiosInstance.delete(`${user?.username}/?user=${modifiedUser.username}`);

  return useMutation<unknown, AxiosError<IError>, User, DeleteUserContext>({
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
    onError: (error, user, context) => {
      // reverting to the old rows here user is the user to be deleted
      setRows([...rows, user]);
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
