import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { enqueueSnackbar } from "notistack";
import useAxios from "../../api/axiosInstance";
import Dealer from "../../entities/Dealer";

interface DeleteDealerContext {
  previousDealerList: Dealer[];
}

interface IError {
  error: string;
}

function useDeleteDealer() {
  const axiosInstance = useAxios();
  const queryClient = useQueryClient();

  const deleteDealer = async (dealer: Dealer) =>
    axiosInstance.delete(`dealer/${dealer.slug}/`);

  return useMutation<
    AxiosResponse,
    AxiosError<IError>,
    Dealer,
    DeleteDealerContext
  >({
    mutationFn: deleteDealer,
    onMutate: (deletingDealer) => {
      const previousDealerList =
        queryClient.getQueryData<Dealer[]>(["dealerList"]) || [];

      queryClient.setQueryData<Dealer[]>(["dealerList"], (dealerList = []) =>
        dealerList.filter((dealer) => dealer.id !== deletingDealer.id)
      );

      return { previousDealerList };
    },
    onSuccess: () => {
      enqueueSnackbar("Dealer sucessfully Deleted", { variant: "success" });
    },
    onError: (error, _dealer, context) => {
      let errorMessage = "";
      if (error.code === "ERR_NETWORK") {
        errorMessage = error.message;
      } else {
        errorMessage = error.response?.data.error || "Failed to Delete Dealer";
      }
      enqueueSnackbar(errorMessage, { variant: "error" });
      if (!context) return;
      queryClient.setQueryData<Dealer[]>(
        ["dealerList"],
        context.previousDealerList
      );
    },
  });
}

export default useDeleteDealer;
