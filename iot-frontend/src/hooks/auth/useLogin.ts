import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { enqueueSnackbar } from "notistack";
import { useLocation, useNavigate } from "react-router-dom";
import { axiosPrivate } from "../../api/axios";
import UserGroups from "../../constants/userGroups";
import User from "../../entities/User";
import CsrfError from "../../errors/csrfError";
import useAuthStore from "../../store/authStore";
import getCsrf from "../../utilis/getCsrf";

interface UserResponse {
  user: User;
  access: string;
}

interface FormData {
  username: string;
  password: string;
}

interface IError {
  error?: string;
}

const useLogin = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);
  const setIsUserSuperAdmin = useAuthStore(
    (state) => state.setIsUserSuperAdmin
  );
  const setIsUserCompanySuperAdmin = useAuthStore(
    (state) => state.setIsUserCompanySuperAdmin
  );
  const setIsUserDealer = useAuthStore((state) => state.setIsUserDealer);
  const setIsUserAdmin = useAuthStore((state) => state.setIsUserAdmin);

  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  if (location.state?.from === "logout") {
    queryClient.clear();
  }

  const loginUser = async (data: FormData) => {
    const csrfToken = await getCsrf();
    if (csrfToken === null) {
      throw new CsrfError();
    }
    return axiosPrivate
      .post<UserResponse>("account/login/", data, {
        headers: {
          "X-CSRFToken": csrfToken,
        },
      })
      .then((res) => res.data);
  };

  return useMutation<UserResponse, AxiosError<IError>, FormData>({
    mutationFn: loginUser,
    onSuccess: ({ user, access }: UserResponse) => {
      setUser(user);
      setToken(access);
      if (user.groups.includes(UserGroups.superAdminGroup)) {
        setIsUserSuperAdmin(true);
      } else if (user.groups.includes(UserGroups.companySuperAdminGroup)) {
        setIsUserCompanySuperAdmin(true);
        setIsUserAdmin(true);
      } else if (user.groups.includes(UserGroups.dealerGroup)) {
        setIsUserDealer(true);
        setIsUserAdmin(true);
      } else if (user.groups.includes(UserGroups.adminGroup)) {
        setIsUserAdmin(true);
      }
      const redirectFromLogout = location.state?.from === "logout";
      const redirectUrl = redirectFromLogout
        ? "/"
        : location.state?.from || "/";
      navigate(redirectUrl, {
        replace: true,
      });
      enqueueSnackbar("Login sucessfull", { variant: "success" });
    },
    onError: (error) => {
      if (error instanceof CsrfError) {
        enqueueSnackbar(error.message, { variant: "error" });
      } else {
        const errorMessage = error?.response?.data.error
          ? error?.response?.data.error
          : "Login Failed";
        enqueueSnackbar(errorMessage, {
          variant: "error",
        });
      }
    },
  });
};

export default useLogin;
