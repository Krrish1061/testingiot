import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import jwtDecode, { JwtPayload } from "jwt-decode";
import { enqueueSnackbar } from "notistack";
import { useLocation, useNavigate } from "react-router-dom";
import { axiosPrivate } from "../../api/axios";
import CsrfError from "../../errors/csrfError";
import useAuthStore from "../../store/authStore";
import getCsrf from "../../utilis/getCsrf";

interface Token {
  access: string;
}

interface accessToken extends JwtPayload {
  user_id: number;
  username: string;
  type: "ADMIN" | "MODERATOR" | "VIEWER" | "SUPERADMIN";
  groups: string[];
}

const useRefreshToken = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);

  const token = useAuthStore((state) => state.token);
  const refreshToken = async () => {
    const csrfToken = await getCsrf();
    if (csrfToken === null) {
      throw new CsrfError();
    }
    return axiosPrivate
      .post<Token>("account/token/refresh/", null, {
        headers: {
          "X-CSRFToken": csrfToken,
        },
      })
      .then((res) => res.data.access);
  };

  return useMutation<string, AxiosError<string>>({
    mutationFn: refreshToken,
    onSuccess: (newtoken) => {
      if (!token) {
        const { user_id, username, type, groups }: accessToken =
          jwtDecode(newtoken);
        setUser({
          id: user_id,
          username: username,
          type: type,
          groups: groups,
        });
      }
      setToken(newtoken);
    },
    onError: (error) => {
      // handle the network err
      if (error instanceof CsrfError) {
        enqueueSnackbar(error.message, { variant: "error" });
        // reload the page after certain second
      }

      if (error.response?.status === 401) {
        const loginUrl = "/login";
        if (location.pathname !== loginUrl) {
          enqueueSnackbar("Please Login before proceeding any further.", {
            variant: "info",
          });
        }
        const redirectUrl = location.state?.from || location.pathname;
        navigate(loginUrl, {
          state: { from: redirectUrl },
          replace: true,
        });
      }
    },
  });
};

export default useRefreshToken;
