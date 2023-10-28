import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useAxios from "../api/axiosInstance";
import User from "../entities/User";
import useAuthStore from "../store/authStore";

function useGetUser() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const axiosInstance = useAxios();

  const fetchUser = () =>
    axiosInstance
      .get<User>(`${user?.username}/${user?.id}/`)
      .then((res) => res.data);

  return useQuery<User, AxiosError>({
    queryKey: [`${user?.username}`],
    queryFn: fetchUser,
    onSuccess: (data) => {
      setUser(data);
    },
  });
}

export default useGetUser;
