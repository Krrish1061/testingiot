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

interface IError {
  error?: string;
  errors?: string[];
}

function usePasswordReset() {
  const { username, token } = useParams();
  const navigate = useNavigate();
  const setPassword = async (data: FormData) =>
    axiosPrivate
      .post(`account/password-reset-confirm/${username}/${token}`, data)
      .then((res) => res.data);

  return useMutation<Response, AxiosError<IError>, FormData>({
    mutationFn: setPassword,
    onSuccess: () => {
      navigate("/login", { replace: true });

      enqueueSnackbar("Password Reset successfully", {
        variant: "success",
      });
    },
    onError: (error) => {
      enqueueSnackbar(
        (error.response?.data.error && error.response?.data.error) ||
          (error.response?.data.errors && error.response?.data.errors[0]) ||
          "Password Reset Failed",
        {
          variant: "error",
        }
      );
    },
  });
}

export default usePasswordReset;
