import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useAxios from "../api/axiosInstance";
// import User from "../entities/User";
import useAuthStore from "../store/authStore";
import { enqueueSnackbar } from "notistack";

function useDeleteUser() {
  const user = useAuthStore((state) => state.user);
  const axiosInstance = useAxios();

  const deleteUser = () =>
    axiosInstance.delete(`${user?.username}/${user?.id}/`);

  return useMutation({
    mutationFn: deleteUser,

    onSuccess: () => {
      enqueueSnackbar("User sucessfull Deleted", { variant: "success" });
    },
    onError: (error: AxiosError) => {
      console.log(error);
      enqueueSnackbar("User Deletion failed", { variant: "error" });
    },
  });
}

export default useDeleteUser;
