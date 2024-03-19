import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useAuthStore from "../../store/authStore";
import { enqueueSnackbar } from "notistack";
import useAxios from "../../api/axiosInstance";
import UserProfile from "../../entities/UserProfile";
import User from "../../entities/User";

interface IFormData {
  profile_picture: File;
}

const useUploadProfileImage = () => {
  const axiosInstance = useAxios();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();

  const UploadImage = async (data: IFormData) =>
    axiosInstance
      .patch<UserProfile>(`${user?.username}/profile/`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => res.data);

  return useMutation<UserProfile, AxiosError<string>, IFormData>({
    mutationFn: UploadImage,
    onSuccess: (userProfile) => {
      setUser({
        ...user,
        profile: userProfile,
      } as User);

      queryClient.setQueryData<User[]>(["userList"], (cachedUsers = []) =>
        cachedUsers.map((cachedUser) =>
          cachedUser.id === user?.id
            ? { ...cachedUser, profile: userProfile }
            : cachedUser
        )
      );

      enqueueSnackbar("Profile Picture sucessfully changed", {
        variant: "success",
      });
    },
    onError: (error) => {
      let errorMessage = "";
      if (error.code === "ERR_NETWORK") {
        errorMessage = error.message;
      } else {
        errorMessage = error.response?.data || "";
      }
      enqueueSnackbar(errorMessage, {
        variant: "error",
      });
    },
  });
};

export default useUploadProfileImage;
