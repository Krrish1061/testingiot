import { useQuery } from "@tanstack/react-query";
import useAxios from "../../api/axiosInstance";
import UserGroups from "../../constants/userGroups";
import User from "../../entities/User";
import useAuthStore from "../../store/authStore";

function useGetUser(isEnabled: boolean = true) {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const setIsUserSuperAdmin = useAuthStore(
    (state) => state.setIsUserSuperAdmin
  );
  const setIsUserCompanySuperAdmin = useAuthStore(
    (state) => state.setIsUserCompanySuperAdmin
  );
  const setIsUserDealer = useAuthStore((state) => state.setIsUserDealer);
  const setIsUserAdmin = useAuthStore((state) => state.setIsUserAdmin);
  const axiosInstance = useAxios();

  const fetchUser = () =>
    axiosInstance.get<User>(`${user?.username}/`).then((res) => res.data);

  return useQuery<User>({
    queryKey: user ? ["users", user.username] : ["user"],
    queryFn: fetchUser,
    enabled: isEnabled,
    onSuccess: (data) => {
      const groups = data.groups;
      if (groups.includes(UserGroups.superAdminGroup)) {
        setIsUserSuperAdmin(true);
      } else if (groups.includes(UserGroups.companySuperAdminGroup)) {
        setIsUserCompanySuperAdmin(true);
        setIsUserAdmin(true);
      } else if (groups.includes(UserGroups.dealerGroup)) {
        setIsUserDealer(true);
        setIsUserAdmin(true);
      } else if (groups.includes(UserGroups.adminGroup)) {
        setIsUserAdmin(true);
      }
      if (data.profile?.date_of_birth) {
        data.profile.date_of_birth = new Date(data.profile.date_of_birth);
      }
      setUser(data);
    },
  });
}

export default useGetUser;
