import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useAuthStore from "../store/authStore";
import { enqueueSnackbar } from "notistack";
import getCsrf from "../utilis/getCsrf";
import CsrfError from "../errors/csrfError";
import useAxios from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

const useLogout = () => {
  const axiosInstance = useAxios();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);
  const navigate = useNavigate();

  const logoutUser = async () => {
    const csrfToken = await getCsrf();
    if (csrfToken === null) {
      throw new CsrfError();
    }
    return axiosInstance
      .post<string>(`${user?.username}/logout/`)
      .then((res) => res.data);
  };

  return useMutation<string, AxiosError<string>>({
    mutationFn: logoutUser,
    onSuccess: () => {
      enqueueSnackbar("Logout sucessfull", { variant: "success" });
      setUser(null);
      setToken(null);
      navigate("/login", {
        replace: true,
      });
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

export default useLogout;
