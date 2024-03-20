import useAuthStore from "../../store/authStore";
import useAxios from "../../api/axiosInstance";
import { AxiosError } from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import UserProfile from "../../entities/UserProfile";
import User from "../../entities/User";
import dayjs from "dayjs";

interface IFormInputs {
  first_name: string | null;
  last_name: string | null;
  date_of_birth: Date | null;
  address: string | null;
  facebook_profile?: string | null | undefined;
  linkedin_profile?: string | null | undefined;
  phone_number?: string | null;
}

interface ChangeUserProfileContext {
  previousUserList: User[];
  previousUser: User | null;
}

function useUpdateProfile() {
  const axiosInstance = useAxios();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();

  const UpdateProfile = async (data: IFormInputs) =>
    axiosInstance
      .patch<UserProfile>(`${user?.username}/profile/`, {
        ...data,
        date_of_birth: data.date_of_birth
          ? dayjs(data.date_of_birth).format("YYYY-MM-DD")
          : null,
      })
      .then((res) => res.data);

  return useMutation<
    UserProfile,
    AxiosError<string>,
    IFormInputs,
    ChangeUserProfileContext
  >({
    mutationFn: UpdateProfile,
    onMutate: (newUserProfile) => {
      const previousUserList =
        queryClient.getQueryData<User[]>(["userList"]) || [];

      const previousUser = user;

      const newProfile = { ...user?.profile, ...newUserProfile };

      queryClient.setQueryData<User[]>(["userList"], (cachedUsers = []) =>
        cachedUsers.map((cachedUser) =>
          cachedUser.id === user?.id
            ? { ...cachedUser, profile: newProfile as UserProfile }
            : cachedUser
        )
      );

      setUser({ ...user, profile: newProfile } as User);

      return { previousUserList, previousUser };
    },
    onSuccess() {
      enqueueSnackbar("Profile Upadated", {
        variant: "success",
      });
    },
    onError: (error, _, context) => {
      let errorMessage = "";
      if (error.code === "ERR_NETWORK") {
        errorMessage = error.message;
      } else {
        errorMessage = error.response?.data || "";
      }
      enqueueSnackbar(errorMessage, {
        variant: "error",
      });

      if (!context) return;
      queryClient.setQueryData<User[]>(["userList"], context.previousUserList);

      if (context.previousUser) setUser(context.previousUser);
    },
  });
}

export default useUpdateProfile;
