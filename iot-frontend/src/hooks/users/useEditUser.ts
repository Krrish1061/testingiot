import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { enqueueSnackbar } from "notistack";
import useAxios from "../../api/axiosInstance";
import User from "../../entities/User";
import useAuthStore from "../../store/authStore";

interface EditUserContext {
  previousUserList: User[];
}

interface IError {
  error: string;
  errors: string[];
}

function useEditUser() {
  const user = useAuthStore((state) => state.user);
  const axiosInstance = useAxios();
  const queryClient = useQueryClient();

  const editUser = async (modifiedUser: User) => {
    return axiosInstance
      .patch<User>(
        `${user?.username}/?user=${modifiedUser.username}`,
        modifiedUser
      )
      .then((res) => res.data);
  };

  return useMutation<User, AxiosError<IError>, User, EditUserContext>({
    mutationFn: editUser,
    onMutate: (editingUser) => {
      const previousUserList =
        queryClient.getQueryData<User[]>(["userList"]) || [];

      queryClient.setQueryData<User[]>(["userList"], (user = []) =>
        user.map((user) =>
          user.username === editingUser.username ? editingUser : user
        )
      );

      return { previousUserList };
    },
    onSuccess: (savedUser, editeduser) => {
      // update the user or user list
      enqueueSnackbar("User sucessfully Edited", { variant: "success" });
      queryClient.setQueryData<User[]>(["userList"], (users) =>
        users?.map((user) => (user.id === editeduser.id ? savedUser : user))
      );
    },
    onError: (error, _editedUser, context) => {
      let errorMessage = "";
      if (error.code === "ERR_NETWORK") {
        errorMessage = error.message;
      } else {
        errorMessage =
          error.response?.data.error ||
          (error.response?.data.errors && error.response?.data.errors[0]) ||
          "User Modification failed";
      }
      enqueueSnackbar(errorMessage, { variant: "error" });

      if (!context) return;
      queryClient.setQueryData<User[]>(["userList"], context.previousUserList);
    },
  });
}

export default useEditUser;
