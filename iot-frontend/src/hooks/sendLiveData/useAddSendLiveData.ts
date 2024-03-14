import { useMutation } from "@tanstack/react-query";
import useAxios from "../../api/axiosInstance";
import SendLiveData from "../../entities/SendLiveData";
import { enqueueSnackbar } from "notistack";
import { AxiosError } from "axios";
import useSendLiveDataDataGridStore from "../../store/datagrid/sendLiveDataDataGrid";

interface IFormInputs {
  endpoint: string;
  user?: string | null;
  company?: string | null;
  send_device_board_id: boolean;
}

interface IError {
  error?: string[];
  user?: string[];
  company?: string[];
}

function useAddSendLiveData() {
  const axiosInstance = useAxios();
  const rows = useSendLiveDataDataGridStore((state) => state.rows);
  const setRows = useSendLiveDataDataGridStore((state) => state.setRows);

  const addSendLiveData = async (data: IFormInputs) => {
    return axiosInstance
      .post<SendLiveData>("send-data/", data)
      .then((res) => res.data);
  };

  return useMutation<SendLiveData, AxiosError<IError>, IFormInputs>({
    mutationFn: addSendLiveData,
    onSuccess: (sendLiveData) => {
      setRows([...rows, sendLiveData]);
      enqueueSnackbar("Endpoint Sucessfully Added", { variant: "success" });
    },
    onError: (error) => {
      const error_message =
        (error.response?.data.error && error.response?.data.error[0]) ||
        (error.response?.data.user && error.response?.data.user[0]) ||
        (error.response?.data.company && error.response?.data.company[0]);
      enqueueSnackbar(error_message, {
        variant: "error",
      });
    },
  });
}

export default useAddSendLiveData;
