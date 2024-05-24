import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import useAxios from "../../api/axiosInstance";
import CsrfError from "../../errors/csrfError";
import useAuthStore from "../../store/authStore";
import useWebSocketStore from "../../store/webSocket/webSocketStore";
import getCsrf from "../../utilis/getCsrf";
import useUserDataGridStore from "../../store/datagrid/userDataGridStore";

//  userefresh hook is called 3 times due to react query setting and
// thats why we are seeing multiple error when we logout.

const useLogout = () => {
  const axiosInstance = useAxios();
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);
  const setIsUserSuperAdmin = useAuthStore(
    (state) => state.setIsUserSuperAdmin
  );
  const setliveDataToNull = useWebSocketStore(
    (state) => state.setliveDataToNull
  );
  const setSensorDataToNull = useWebSocketStore(
    (state) => state.setSensorDataToNull
  );
  const setEmptySensorDataUpToDays = useWebSocketStore(
    (state) => state.setEmptySensorDataUpToDays
  );
  const setRows = useUserDataGridStore((state) => state.setRows);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const logoutUser = async (username: string | undefined) => {
    const csrfToken = await getCsrf();
    if (csrfToken === null) {
      throw new CsrfError();
    }
    return axiosInstance
      .post<string>(`account/${username}/logout/`)
      .then((res) => res.data);
  };

  return useMutation<string, AxiosError<string>, string | undefined>({
    mutationFn: logoutUser,
    onSuccess: () => {
      setUser(null);
      setToken(null);
      setIsUserSuperAdmin(false);
      setliveDataToNull();
      setSensorDataToNull();
      setEmptySensorDataUpToDays();
      setRows([]);
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
