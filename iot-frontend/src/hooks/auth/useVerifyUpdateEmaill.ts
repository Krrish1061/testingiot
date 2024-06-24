import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { enqueueSnackbar } from "notistack";
import { useParams } from "react-router-dom";
import axiosInstance from "../../api/axios";

interface IResponse {
  message: string;
}

interface IError {
  error: string;
}

function useVerifyUpdateEmail() {
  const { token, username } = useParams();

  const verifyUpdateEmail = async () => {
    return axiosInstance
      .post<IResponse>(`account/update-email/${username}/${token}`)
      .then((res) => res.data);
  };

  return useMutation<IResponse, AxiosError<IError>>({
    mutationFn: verifyUpdateEmail,
    onSuccess: () => {
      enqueueSnackbar("Email Verified", { variant: "success" });
    },
  });
}

export default useVerifyUpdateEmail;
