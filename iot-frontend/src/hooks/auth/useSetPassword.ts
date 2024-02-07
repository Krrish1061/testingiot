import { useNavigate, useParams } from "react-router-dom";
import { axiosPrivate } from "../../api/axios";
import { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";

interface FormData {
  password: string;
}

interface Response {
  message: string;
}

function useSetPassword() {
  const { username, token } = useParams();
  const navigate = useNavigate();
  const setPassword = async (data: FormData) =>
    axiosPrivate
      .post(`account/set-user-password/${username}/${token}`, data)
      .then((res) => res.data);

  return useMutation<Response, AxiosError<Response>, FormData>({
    mutationFn: setPassword,
    onSuccess: () => {
      navigate("/login", { replace: true });

      enqueueSnackbar("Password successfully set", {
        variant: "success",
      });
    },
    onError: (error) => {
      enqueueSnackbar(error.response?.data.message, {
        variant: "error",
      });
    },
  });
}

export default useSetPassword;
