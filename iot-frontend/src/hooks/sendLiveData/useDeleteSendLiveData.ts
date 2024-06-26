import { enqueueSnackbar } from "notistack";
import useAxios from "../../api/axiosInstance";
import SendLiveData from "../../entities/SendLiveData";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";

interface DeleteSendLiveDataContext {
  previousSendLiveDataList: SendLiveData[];
}

interface IError {
  error: string;
}

function useDeleteSendLiveData() {
  const axiosInstance = useAxios();
  const queryClient = useQueryClient();
  const deleteSendLiveData = async (sendLiveData: SendLiveData) => {
    return axiosInstance.delete("send-data/", {
      params: {
        company: sendLiveData.company,
        user: sendLiveData.user,
      },
    });
  };
  return useMutation<
    AxiosResponse,
    AxiosError<IError>,
    SendLiveData,
    DeleteSendLiveDataContext
  >({
    mutationFn: deleteSendLiveData,
    onMutate: (deletingSendLiveData) => {
      const previousSendLiveDataList =
        queryClient.getQueryData<SendLiveData[]>(["sendDataList"]) || [];

      queryClient.setQueryData<SendLiveData[]>(
        ["sendDataList"],
        (sendDataLists = []) =>
          sendDataLists.filter(
            (sendDataList) => sendDataList.id !== deletingSendLiveData.id
          )
      );
      return { previousSendLiveDataList };
    },
    onSuccess: () => {
      enqueueSnackbar("Sucessfully Deleted", { variant: "success" });
    },
    onError: (error, _sendLiveData, context) => {
      let errorMessage = "";
      if (error.code === "ERR_NETWORK") {
        errorMessage = error.message;
      } else {
        errorMessage = error.response?.data.error || "Endpoint Deletion failed";
      }
      enqueueSnackbar(errorMessage, { variant: "error" });
      if (!context) return;
      queryClient.setQueryData<SendLiveData[]>(
        ["sendDataList"],
        context.previousSendLiveDataList
      );
    },
  });
}

export default useDeleteSendLiveData;
