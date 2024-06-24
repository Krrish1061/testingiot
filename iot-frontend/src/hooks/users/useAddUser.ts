import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { enqueueSnackbar } from "notistack";
import useAxios from "../../api/axiosInstance";
import UserGroups from "../../constants/userGroups";
import UserTypes from "../../constants/userTypes";
import User from "../../entities/User";
import useAuthStore from "../../store/authStore";
import useUserDataGridStore from "../../store/datagrid/userDataGridStore";

interface IFormInputs {
  email: string;
  type: "ADMIN" | "MODERATOR" | "VIEWER";
  company?: string | null | undefined;
}

interface IError {
  error: string;
  errors: string[];
  email: string[];
}

interface AddUserContext {
  previousUserList: User[];
  newUserId: number;
}

const generateRandomId = (): number => {
  // Generate a random number between 1000 and 9999
  return Math.floor(Math.random() * 9000) + 1000;
};

const generateRandomUsername = (): string => {
  // Generate a random username with the prefix "user" and a random number between 1000 and 9999
  return `user${Math.floor(Math.random() * 9000) + 1000}`;
};

const useAddUser = () => {
  const axiosInstance = useAxios();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const rows = useUserDataGridStore((state) => state.rows);
  const setRows = useUserDataGridStore((state) => state.setRows);

  const postUser = (data: IFormInputs) =>
    axiosInstance
      .post<User>(`${user?.username}/add/user/`, data)
      .then((res) => res.data);

  return useMutation<User, AxiosError<IError>, IFormInputs, AddUserContext>({
    mutationFn: postUser,
    onMutate: (formInputs: IFormInputs) => {
      const previousUserList =
        queryClient.getQueryData<User[]>(["userList"]) || [];

      const groupname =
        formInputs.type === UserTypes.admin
          ? UserGroups.adminGroup
          : formInputs.type === UserTypes.moderator
          ? UserGroups.moderatorGroup
          : UserGroups.viewerGroup;

      const newUserId = generateRandomId();

      const newUser = {
        ...formInputs,
        id: newUserId,
        username: generateRandomUsername(),
        groups: [groupname],
      };

      queryClient.setQueryData<User[]>(["userList"], (user = []) => [
        ...user,
        newUser,
      ]);

      return { previousUserList, newUserId };
    },
    onSuccess: (newUser, _formsInputs, context) => {
      enqueueSnackbar("User Successfully Created", {
        variant: "success",
      });

      if (!context) return;
      queryClient.setQueryData<User[]>(["userList"], (users) =>
        users?.map((user) => (user.id === context.newUserId ? newUser : user))
      );

      if (rows.length !== 0) setRows([...rows, newUser]);
    },
    onError: (error, _formsInputs, context) => {
      let errorMessage = "";
      if (error.code === "ERR_NETWORK") {
        errorMessage = error.message;
      } else {
        errorMessage =
          error.response?.data.error ||
          (error.response?.data.errors && error.response?.data.errors[0]) ||
          error.response?.data.email[0] ||
          "Failed to Create User";
      }
      enqueueSnackbar(errorMessage, {
        variant: "error",
      });

      if (!context) return;
      queryClient.setQueryData<User[]>(["userList"], context.previousUserList);
      if (rows.length !== 0) {
        setRows(rows.filter((row) => row.id !== context.newUserId));
      }
    },
  });
};

export default useAddUser;
