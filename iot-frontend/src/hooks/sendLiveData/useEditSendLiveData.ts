import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxios from "../../api/axiosInstance";
import SendLiveData from "../../entities/SendLiveData";
import { enqueueSnackbar } from "notistack";
import { AxiosError } from "axios";

interface EditSendLiveDataContext {
  previousSendLiveDataList: SendLiveData[];
}

interface IError {
  error: string;
}

function useEditSendLiveData() {
  const axiosInstance = useAxios();
  const queryClient = useQueryClient();

  const editSendLiveData = async (sendLiveData: SendLiveData) => {
    return axiosInstance
      .patch<SendLiveData>("send-data/", sendLiveData, {
        params: {
          company: sendLiveData.company,
          user: sendLiveData.user,
        },
      })
      .then((res) => res.data);
  };

  return useMutation<
    SendLiveData,
    AxiosError<IError>,
    SendLiveData,
    EditSendLiveDataContext
  >({
    mutationFn: editSendLiveData,
    onMutate: (editingSendLiveData) => {
      const previousSendLiveDataList =
        queryClient.getQueryData<SendLiveData[]>(["sendDataList"]) || [];

      queryClient.setQueryData<SendLiveData[]>(
        ["sendDataList"],
        (sendDataLists = []) =>
          sendDataLists.map((sendDataList) =>
            sendDataList.id === editingSendLiveData.id
              ? editingSendLiveData
              : sendDataList
          )
      );
      return { previousSendLiveDataList };
    },
    onSuccess: (newSendDataList) => {
      enqueueSnackbar("Sucessfully Edited", { variant: "success" });
      queryClient.setQueryData<SendLiveData[]>(
        ["sendDataList"],
        (sendDataLists) =>
          sendDataLists?.map((sendDataList) =>
            sendDataList.id === newSendDataList.id
              ? newSendDataList
              : sendDataList
          )
      );
    },
    onError: (error, _sendLiveData, context) => {
      let errorMessage = "";
      if (error.code === "ERR_NETWORK") {
        errorMessage = error.message;
      } else {
        errorMessage = error.response?.data.error || "Failed to Edit Endpoint";
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

export default useEditSendLiveData;
