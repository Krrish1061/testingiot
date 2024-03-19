import { useMutation, useQueryClient } from "@tanstack/react-query";
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

interface ChangeUsernameContext {
  previousUserList: User[];
}

function useChangeUsername() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const axiosInstance = useAxios();
  const queryClient = useQueryClient();

  const changeUsername = async (data: IInputs) =>
    axiosInstance
      .post<IResponse>(`${user?.username}/change-username/`, data)
      .then((res) => res.data);

  return useMutation<
    IResponse,
    AxiosError<IError>,
    IInputs,
    ChangeUsernameContext
  >({
    mutationFn: changeUsername,
    onMutate: (newUser) => {
      const previousUserList =
        queryClient.getQueryData<User[]>(["userList"]) || [];

      queryClient.setQueryData<User[]>(["userList"], (cachedUsers = []) =>
        cachedUsers.map((cachedUser) =>
          cachedUser.id === user?.id
            ? { ...cachedUser, username: newUser.username }
            : cachedUser
        )
      );

      return { previousUserList };
    },
    onSuccess: (_message, inputs) => {
      setUser({ ...user, username: inputs.username } as User);
    },
    onError: (error, _, context) => {
      enqueueSnackbar(error.response?.data.error, {
        variant: "error",
      });
      if (!context) return;
      queryClient.setQueryData<User[]>(["userList"], context.previousUserList);
    },
  });
}

export default useChangeUsername;
