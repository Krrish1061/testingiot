import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import axiosInstance from "../../api/axios";
import { useParams, useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";

interface VerifyEmail {
  message: string;
}

interface IError {
  error: string;
}

function useVerifyEmail() {
  const { token, username } = useParams();
  const navigate = useNavigate();

  const verifyEmail = async () => {
    return axiosInstance
      .post<VerifyEmail>(`account/validate-email/${username}/${token}`)
      .then((res) => res.data);
  };

  return useMutation<VerifyEmail, AxiosError<IError>>({
    mutationFn: verifyEmail,
    onSuccess: () => {
      navigate(`/set-user-password/${username}/${token}`, {
        replace: true,
      });
      enqueueSnackbar("Email Verified", { variant: "success" });
    },
  });
}

export default useVerifyEmail;
