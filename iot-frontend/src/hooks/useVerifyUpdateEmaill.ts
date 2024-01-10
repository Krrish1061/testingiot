import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import axiosInstance from "../api/axios";
import { useParams, useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";

interface IResponse {
  message: string;
}

interface IError {
  error: string;
}

function useVerifyUpdateEmail() {
  const { token, username } = useParams();
  const navigate = useNavigate();

  const verifyUpdateEmail = async () => {
    return axiosInstance
      .post<IResponse>(`update-email/${username}/${token}`)
      .then((res) => res.data);
  };

  return useMutation<IResponse, AxiosError<IError>>({
    mutationFn: verifyUpdateEmail,
    onSuccess: () => {
      navigate("/", {
        replace: true,
      });
      enqueueSnackbar("Email Verified", { variant: "success" });
    },
  });
}

export default useVerifyUpdateEmail;
