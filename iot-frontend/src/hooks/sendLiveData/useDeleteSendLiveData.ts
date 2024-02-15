import { enqueueSnackbar } from "notistack";
import useAxios from "../../api/axiosInstance";
import SendLiveData from "../../entities/SendLiveData";
import useSendLiveDataDataGridStore from "../../store/datagrid/sendLiveDataDataGrid";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

function useDeleteSendLiveData() {
  const axiosInstance = useAxios();
  const rows = useSendLiveDataDataGridStore((state) => state.rows);
  const setRows = useSendLiveDataDataGridStore((state) => state.setRows);
  const deleteSendLiveData = async (sendLiveData: SendLiveData) => {
    return axiosInstance.delete("send-data/", {
      params: {
        company: sendLiveData.company,
        user: sendLiveData.user,
      },
    });
  };
  return useMutation({
    mutationFn: deleteSendLiveData,
    onSuccess: () => {
      enqueueSnackbar("Sucessfully Deleted", { variant: "success" });
    },
    onError: (_error: AxiosError, sensor) => {
      setRows([...rows, sensor]);
      enqueueSnackbar("Deletion failed", { variant: "error" });
    },
  });
}

export default useDeleteSendLiveData;
