import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxios from "../../api/axiosInstance";
import SendLiveData from "../../entities/SendLiveData";
import { enqueueSnackbar } from "notistack";
import { AxiosError } from "axios";

interface IFormInputs {
  endpoint: string;
  user?: string | null;
  company?: string | null;
  send_device_board_id: boolean;
}

interface IError {
  error?: string;
  errors?: string[];
  user?: string[];
  company?: string[];
}

interface AddSendLiveDataContext {
  previousSendLiveDataList: SendLiveData[];
  newSendLiveDataId: number;
}

function useAddSendLiveData() {
  const axiosInstance = useAxios();
  const queryClient = useQueryClient();

  const addSendLiveData = async (data: IFormInputs) => {
    return axiosInstance
      .post<SendLiveData>("send-data/", data)
      .then((res) => res.data);
  };

  return useMutation<
    SendLiveData,
    AxiosError<IError>,
    IFormInputs,
    AddSendLiveDataContext
  >({
    mutationFn: addSendLiveData,
    onMutate: (formInputs: IFormInputs) => {
      const previousSendLiveDataList =
        queryClient.getQueryData<SendLiveData[]>(["sendDataList"]) || [];

      const newSendLiveDataId = Math.floor(Math.random() * 9000) + 1000;

      const newSendData = {
        ...formInputs,
        id: newSendLiveDataId,
      } as SendLiveData;

      queryClient.setQueryData<SendLiveData[]>(
        ["sendDataList"],
        (sendDataLists = []) => [...sendDataLists, newSendData]
      );

      return { previousSendLiveDataList, newSendLiveDataId };
    },
    onSuccess: (newSendLiveData, _formsInputs, context) => {
      enqueueSnackbar("Endpoint Sucessfully Added", { variant: "success" });
      if (!context) return;
      queryClient.setQueryData<SendLiveData[]>(
        ["sendDataList"],
        (sendDataLists) =>
          sendDataLists?.map((sendData) =>
            sendData.id === context.newSendLiveDataId
              ? newSendLiveData
              : sendData
          )
      );
    },
    onError: (error) => {
      const error_message =
        (error.response?.data.error && error.response?.data.error) ||
        (error.response?.data.errors && error.response?.data.errors[0]) ||
        (error.response?.data.user && error.response?.data.user[0]) ||
        (error.response?.data.company && error.response?.data.company[0]);
      enqueueSnackbar(error_message, {
        variant: "error",
      });
    },
  });
}

export default useAddSendLiveData;
