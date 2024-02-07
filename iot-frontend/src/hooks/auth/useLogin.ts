import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import User from "../../entities/User";
import { axiosPrivate } from "../../api/axios";
import useAuthStore from "../../store/authStore";
import { enqueueSnackbar } from "notistack";
import getCsrf from "../../utilis/getCsrf";
import CsrfError from "../../errors/csrfError";
import UserTypes from "../../constants/userTypes";
import { useLocation, useNavigate } from "react-router-dom";

interface UserResponse {
  user: User;
  access: string;
}

interface FormData {
  username: string;
  password: string;
}

const useLogin = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);
  const setIsUserSuperAdmin = useAuthStore(
    (state) => state.setIsUserSuperAdmin
  );

  const navigate = useNavigate();
  const location = useLocation();

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

  return useMutation<UserResponse, AxiosError<string>, FormData>({
    mutationFn: loginUser,
    onSuccess: (userResponse) => {
      setUser(userResponse.user);
      setToken(userResponse.access);
      if (userResponse.user.type === UserTypes.superAdmin) {
        setIsUserSuperAdmin(true);
      }
      const redirectUrl = location.state?.from || "/";
      navigate(redirectUrl, {
        replace: true,
      });
      enqueueSnackbar("Login sucessfull", { variant: "success" });
    },
    onError: (error) => {
      if (error instanceof CsrfError) {
        enqueueSnackbar(error.message, { variant: "error" });
      } else {
        enqueueSnackbar(error?.response ? error.response.data : error.message, {
          variant: "error",
        });
      }
    },
  });
};

export default useLogin;
