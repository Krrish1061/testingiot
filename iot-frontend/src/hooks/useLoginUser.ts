import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import User from "../entities/User";
import { axiosPrivate } from "../api/axios";
import useAuthStore from "../store/authStore";
import { enqueueSnackbar } from "notistack";
import getCsrf from "../utilis/getCsrf";
import CsrfError from "../errors/csrfError";

interface UserResponse {
  user: User;
  access: string;
}

interface FormData {
  username: string;
  password: string;
}

const useLoginUser = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);

  const loginUser = async (data: FormData) => {
    const csrfToken = await getCsrf();
    if (csrfToken === null) {
      throw new CsrfError();
    }
    return axiosPrivate
      .post<UserResponse>("/login/", data, {
        headers: {
          "X-CSRFToken": csrfToken,
        },
      })
      .then((res) => res.data);
  };

  return useMutation<UserResponse, AxiosError<string>, FormData>({
    mutationFn: loginUser,
    onSuccess: (UserResponse) => {
      setUser(UserResponse.user);
      setToken(UserResponse.access);
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

export default useLoginUser;
