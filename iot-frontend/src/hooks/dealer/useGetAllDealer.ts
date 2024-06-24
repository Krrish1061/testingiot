import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useAxios from "../../api/axiosInstance";
import Dealer from "../../entities/Dealer";
import useAuthStore from "../../store/authStore";

function useGetAllDealer() {
  const axiosInstance = useAxios();
  const isUserSuperAdmin = useAuthStore((state) => state.isUserSuperAdmin);

  const fetchDealers = () =>
    axiosInstance.get<Dealer[]>("/dealer/all").then((res) => res.data);

  return useQuery<Dealer[], AxiosError>({
    queryKey: ["dealerList"],
    queryFn: fetchDealers,
    enabled: isUserSuperAdmin,
  });
}

export default useGetAllDealer;
