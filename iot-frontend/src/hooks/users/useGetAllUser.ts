import { useQuery } from "@tanstack/react-query";
import useAxios from "../../api/axiosInstance";
import User from "../../entities/User";
import useAuthStore from "../../store/authStore";

function useGetAllUser(isEnabled: boolean = true) {
  const user = useAuthStore((state) => state.user);
  const axiosInstance = useAxios();

  const fetchUsers = () =>
    axiosInstance
      .get<User[]>(`${user?.username}/users/all`)
      .then((res) => res.data);

  return useQuery<User[]>({
    queryKey: ["userList"],
    queryFn: fetchUsers,
    enabled: isEnabled,
  });
}

export default useGetAllUser;
