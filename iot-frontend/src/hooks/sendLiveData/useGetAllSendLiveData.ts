import { useQuery } from "@tanstack/react-query";
import useAxios from "../../api/axiosInstance";
import SendLiveData from "../../entities/SendLiveData";
import { AxiosError } from "axios";

function useGetAllSendLiveData() {
  const axiosInstance = useAxios();

  const getAllSendLiveData = () =>
    axiosInstance.get<SendLiveData[]>("send-data/all/").then((res) => res.data);
  return useQuery<SendLiveData[], AxiosError>({
    queryKey: ["sendDataList"],
    queryFn: getAllSendLiveData,
  });
}

export default useGetAllSendLiveData;
