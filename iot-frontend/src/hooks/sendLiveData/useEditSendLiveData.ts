import { useMutation } from "@tanstack/react-query";
import useAxios from "../../api/axiosInstance";
import SendLiveData from "../../entities/SendLiveData";
import { enqueueSnackbar } from "notistack";
import { AxiosError } from "axios";

function useEditSendLiveData() {
  const axiosInstance = useAxios();

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

  return useMutation<SendLiveData, AxiosError, SendLiveData>({
    mutationFn: editSendLiveData,
    onSuccess: () => {
      enqueueSnackbar("Sucessfully Edited", { variant: "success" });
    },
    onError: () => {
      // reverting to the old rows here sensor is the sensor to be deleted
      enqueueSnackbar("Modification failed", { variant: "error" });
    },
  });
}

export default useEditSendLiveData;
