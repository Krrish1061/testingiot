import useAuthStore from "../../store/authStore";
import useAxios from "../../api/axiosInstance";
import { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
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

function useUpdateProfile() {
  const axiosInstance = useAxios();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const UpdateProfile = async (data: IFormInputs) =>
    axiosInstance
      .patch<UserProfile>(`${user?.username}/profile/`, {
        ...data,
        date_of_birth: data.date_of_birth
          ? dayjs(data.date_of_birth).format("YYYY-MM-DD")
          : null,
      })
      .then((res) => res.data);

  return useMutation<UserProfile, AxiosError<string>, IFormInputs>({
    mutationFn: UpdateProfile,
    onSuccess(userProfile) {
      setUser({ ...user, profile: userProfile } as User);
      enqueueSnackbar("Profile Upadated", {
        variant: "success",
      });
    },
    onError: (error) => {
      enqueueSnackbar(error?.response ? error.response.data : error.message, {
        variant: "error",
      });
    },
  });
}

export default useUpdateProfile;
