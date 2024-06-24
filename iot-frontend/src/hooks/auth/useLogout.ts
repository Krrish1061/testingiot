import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import useAxios from "../../api/axiosInstance";
import CsrfError from "../../errors/csrfError";
import resetAllStore from "../../store/resetAllStore";
import getCsrf from "../../utilis/getCsrf";

//  userefresh hook is called 3 times due to react query setting and
// thats why we are seeing multiple error when we logout.

const useLogout = () => {
  const axiosInstance = useAxios();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
      resetAllStore();
      queryClient.clear();
      enqueueSnackbar("Logout sucessfull", { variant: "success" });
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
