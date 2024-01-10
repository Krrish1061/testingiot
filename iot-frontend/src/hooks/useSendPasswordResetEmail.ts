import { useMutation } from "@tanstack/react-query";
import { axiosPrivate } from "../api/axios";
import { AxiosError } from "axios";

interface FormData {
  email: string;
}

interface Response {
  message: string;
}

function useSendPasswordResetEmail() {
  const sendPasswordResetEmail = async (data: FormData) =>
    axiosPrivate.post("/password-reset/", data).then((res) => {
      console.log(res.data);
      return res.data;
    });

  return useMutation<Response, AxiosError<string>, FormData>({
    mutationFn: sendPasswordResetEmail,
  });
}

export default useSendPasswordResetEmail;
