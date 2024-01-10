import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import User from "../entities/User";
import useAxios from "../api/axiosInstance";
import { AddUserFormData } from "../components/user/AddUserForm";
import useAuthStore from "../store/authStore";

//  interface error

const useAddUser = () => {
  const axiosInstance = useAxios();
  const user = useAuthStore((state) => state.user);

  const postUser = (data: AddUserFormData) =>
    axiosInstance
      .post<User>(`${user?.username}/add/user/`, data)
      .then((res) => res.data);

  return useMutation<User, AxiosError, AddUserFormData>({
    mutationFn: postUser,
  });
};

export default useAddUser;
