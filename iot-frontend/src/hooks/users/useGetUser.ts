import { useQuery } from "@tanstack/react-query";
import useAxios from "../../api/axiosInstance";
import User from "../../entities/User";
import useAuthStore from "../../store/authStore";

function useGetUser(isEnabled: boolean = true) {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const axiosInstance = useAxios();

  const fetchUser = () =>
    axiosInstance.get<User>(`${user?.username}/`).then((res) => res.data);

  return useQuery<User>({
    queryKey: user ? [`${user.username}`] : undefined,
    queryFn: fetchUser,
    enabled: isEnabled,
    cacheTime: Infinity,
    staleTime: Infinity,
    onSuccess: (data) => {
      if (data.profile?.date_of_birth) {
        data.profile.date_of_birth = new Date(data.profile.date_of_birth);
      }
      setUser(data);
    },
  });
}

export default useGetUser;
