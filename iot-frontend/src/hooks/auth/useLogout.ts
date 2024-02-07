import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useAuthStore from "../../store/authStore";
import { enqueueSnackbar } from "notistack";
import getCsrf from "../../utilis/getCsrf";
import CsrfError from "../../errors/csrfError";
import useAxios from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

//  userefresh hook is called 3 times due to react query setting and
// thats why we are seeing multiple error when we logout.

const useLogout = () => {
  const axiosInstance = useAxios();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);
  const setIsUserSuperAdmin = useAuthStore(
    (state) => state.setIsUserSuperAdmin
  );
  const navigate = useNavigate();

  const logoutUser = async () => {
    const csrfToken = await getCsrf();
    if (csrfToken === null) {
      throw new CsrfError();
    }
    return axiosInstance
      .post<string>(`account/${user?.username}/logout/`)
      .then((res) => res.data);
  };

  return useMutation<string, AxiosError<string>>({
    mutationFn: logoutUser,
    onSuccess: () => {
      enqueueSnackbar("Logout sucessfull", { variant: "success" });
      setUser(null);
      setToken(null);
      setIsUserSuperAdmin(false);
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
