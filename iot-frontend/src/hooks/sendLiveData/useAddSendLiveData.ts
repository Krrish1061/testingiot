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
}

interface IError {
  error: string[];
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
      // reverting to the old rows here sensor is the sensor to be deleted
      enqueueSnackbar(error.response?.data.error[0], {
        variant: "error",
      });
    },
  });
}

export default useAddSendLiveData;
