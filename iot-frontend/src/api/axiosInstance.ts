import dayjs from "dayjs";
import jwtDecode, { JwtPayload } from "jwt-decode";
import { useEffect } from "react";
import useRefreshToken from "../hooks/auth/useRefreshToken";
import useAuthStore from "../store/authStore";
import getCsrf from "../utilis/getCsrf";
import axiosInstance from "./axios";
import { useLocation, useNavigate } from "react-router-dom";
import resetAllStore from "../store/resetAllStore";
import { useQueryClient } from "@tanstack/react-query";

const useAxios = () => {
  const { mutateAsync } = useRefreshToken();
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    const requestIntercept = axiosInstance.interceptors.request.use(
      async (config) => {
        // if request method is not get then fetch csrf token
        if (config.method !== "get") {
          const csrfToken = await getCsrf();
          config.headers["X-CSRFToken"] = csrfToken;
        }

        const accessToken: JwtPayload | null = token ? jwtDecode(token) : null;
        if (accessToken) {
          const isExpired =
            dayjs.unix(accessToken.exp as number).diff(dayjs()) < 1;

          if (!isExpired) {
            config.headers.Authorization = `Bearer ${token}`;
            return config;
          }
        }

        const newAccessToken = await mutateAsync();
        config.headers.Authorization = `Bearer ${newAccessToken}`;
        return config;
      }
    );

    const responseIntercept = axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          resetAllStore();
          queryClient.clear();
          navigate("/login", {
            state: { from: location.pathname },
            replace: true,
          });
        } else {
          return Promise.reject(error);
        }
      }
    );

    return () => {
      axiosInstance.interceptors.request.eject(requestIntercept);
      axiosInstance.interceptors.response.eject(responseIntercept);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return axiosInstance;
};

export default useAxios;
