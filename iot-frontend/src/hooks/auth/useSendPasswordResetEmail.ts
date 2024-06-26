import { useMutation } from "@tanstack/react-query";
import { axiosPrivate } from "../../api/axios";
import { AxiosError } from "axios";

interface FormData {
  email: string;
}

interface Response {
  message: string;
}

interface IError {
  error: string;
}

function useSendPasswordResetEmail() {
  const sendPasswordResetEmail = async (data: FormData) =>
    axiosPrivate.post("account/password-reset/", data).then((res) => {
      return res.data;
    });

  return useMutation<Response, AxiosError<IError>, FormData>({
    mutationFn: sendPasswordResetEmail,
  });
}

export default useSendPasswordResetEmail;
