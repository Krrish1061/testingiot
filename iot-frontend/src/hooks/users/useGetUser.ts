import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useAxios from "../../api/axiosInstance";
import User from "../../entities/User";
import useAuthStore from "../../store/authStore";

function useGetUser(isEnabled: boolean = true) {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const axiosInstance = useAxios();

  const fetchUser = () =>
    axiosInstance.get<User>(`${user?.username}/`).then((res) => res.data);

  return useQuery<User, AxiosError>({
    queryKey: [`${user?.username}`],
    queryFn: fetchUser,
    onSuccess: (data) => {
      if (data.profile?.date_of_birth) {
        data.profile.date_of_birth = new Date(data.profile.date_of_birth);
      }
      setUser(data);
    },
    enabled: isEnabled,
  });
}

export default useGetUser;
