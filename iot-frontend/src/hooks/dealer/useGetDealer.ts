import { useQuery } from "@tanstack/react-query";
import useAxios from "../../api/axiosInstance";
import IDealer from "../../entities/Dealer";
import useAuthStore from "../../store/authStore";
import useDealerStore from "../../store/dealerStore";

function useGetDealer() {
  const user = useAuthStore((state) => state.user);
  const setDealer = useDealerStore((state) => state.setDealer);
  const axiosInstance = useAxios();
  const isUserDealer = useAuthStore((state) => state.isUserDealer);

  const fetchDealer = () =>
    axiosInstance
      .get<IDealer>(`dealer/get/${user?.username}/`)
      .then((res) => res.data);

  return useQuery<IDealer>({
    queryKey: ["dealer"],
    queryFn: fetchDealer,
    enabled: isUserDealer,
    onSuccess: (data) => setDealer(data),
  });
}

export default useGetDealer;
