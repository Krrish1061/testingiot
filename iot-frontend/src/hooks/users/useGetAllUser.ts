import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useAxios from "../../api/axiosInstance";
import User from "../../entities/User";
import useAuthStore from "../../store/authStore";

function useGetAllUser() {
  const user = useAuthStore((state) => state.user);
  const axiosInstance = useAxios();

  const fetchUsers = () =>
    axiosInstance
      .get<User[]>(`${user?.username}/users/all`)
      .then((res) => res.data);

  return useQuery<User[], AxiosError>({
    queryKey: ["userList"],
    queryFn: fetchUsers,
  });
}

export default useGetAllUser;