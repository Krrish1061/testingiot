import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import useAxios from "../../api/axiosInstance";
import CsrfError from "../../errors/csrfError";
import resetAllStore from "../../store/resetAllStore";
import getCsrf from "../../utilis/getCsrf";

const useLogout = () => {
  const axiosInstance = useAxios();
  const navigate = useNavigate();

  const logoutUser = async () => {
    const csrfToken = await getCsrf();
    if (csrfToken === null) {
      throw new CsrfError();
    }
    return axiosInstance
      .post<string>("account/logout/")
      .then((res) => res.data);
  };

  return useMutation<string, AxiosError<string>>({
    mutationFn: logoutUser,
    onSuccess: () => {
      enqueueSnackbar("Logout successfull", { variant: "success" });
      resetAllStore();
      navigate("/login", {
        state: { from: "logout" },
        replace: true,
      });
    },
    onError: (error) => {
      if (error instanceof CsrfError) {
        enqueueSnackbar(error.message, { variant: "error" });
      } else {
        enqueueSnackbar(error?.response ? error.response.data : error.message, {
          variant: "error",
        });
      }
    },
  });
};

export default useLogout;
