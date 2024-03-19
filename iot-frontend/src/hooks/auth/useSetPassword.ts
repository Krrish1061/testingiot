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
  error: string;
  errors: string[];
}

function useSetPassword() {
  const { username, token } = useParams();
  const navigate = useNavigate();
  const setPassword = async (data: FormData) =>
    axiosPrivate
      .post(`account/set-user-password/${username}/${token}`, data)
      .then((res) => res.data);

  return useMutation<Response, AxiosError<IError>, FormData>({
    mutationFn: setPassword,
    onSuccess: () => {
      navigate("/login", { replace: true });

      enqueueSnackbar("Password successfully set", {
        variant: "success",
      });
    },
    onError: (error) => {
      let errorMessage = "";
      if (error.code === "ERR_NETWORK") {
        errorMessage = error.message;
      } else {
        errorMessage =
          error.response?.data.error || error.response?.data.errors[0] || "";
      }
      enqueueSnackbar(errorMessage, {
        variant: "error",
      });
    },
  });
}

export default useSetPassword;
