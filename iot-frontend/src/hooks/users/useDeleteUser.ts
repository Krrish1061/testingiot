import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useAxios from "../../api/axiosInstance";
import useAuthStore from "../../store/authStore";
import { enqueueSnackbar } from "notistack";
import User from "../../entities/User";
import useUserDataGridStore from "../../store/datagrid/userDataGridStore";

function useDeleteUser() {
  const axiosInstance = useAxios();
  const user = useAuthStore((state) => state.user);
  const rows = useUserDataGridStore((state) => state.rows);
  const setRows = useUserDataGridStore((state) => state.setRows);

  const deleteUser = async (modifiedUser: User) =>
    axiosInstance.delete(`${user?.username}/?user=${modifiedUser.username}`);

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      enqueueSnackbar("User sucessfull Deleted", { variant: "success" });
    },
    onError: (error: AxiosError, user) => {
      console.log(error);
      // reverting to the old rows here user is the user to be deleted
      setRows([...rows, user]);
      enqueueSnackbar("User Deletion failed", { variant: "error" });
    },
  });
}

export default useDeleteUser;
