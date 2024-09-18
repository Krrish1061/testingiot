import { useMutation } from "@tanstack/react-query";
import useAxios from "../api/axiosInstance";
import useAuthStore from "../store/authStore";
import { enqueueSnackbar } from "notistack";
import { AxiosError } from "axios";

interface IError {
  error: string;
}

interface IResponse {
  message: string;
}

function useClearCacheData() {
  const user = useAuthStore((state) => state.user);
  const axiosInstance = useAxios();

  const clearCache = () =>
    axiosInstance
      .post(`${user?.username}/clear-cache/`)
      .then((res) => res.data);

  return useMutation<IResponse, AxiosError<IError>>({
    mutationFn: clearCache,
    onSuccess: (response) => {
      enqueueSnackbar(response.message, { variant: "success" });
    },
    onError: (error) => {
      const errorMessage = error.response?.data.error || "Cache cleared failed";
      enqueueSnackbar(errorMessage, { variant: "error" });
    },
  });
}

export default useClearCacheData;
