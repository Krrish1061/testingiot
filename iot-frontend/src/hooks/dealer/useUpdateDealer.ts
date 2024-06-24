import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { enqueueSnackbar } from "notistack";
import useAxios from "../../api/axiosInstance";
import Dealer from "../../entities/Dealer";

interface EditDealerContext {
  previousDealerList: Dealer[];
  previousDealerSlug: string;
}

interface IError {
  error: string;
  errors: string[];
}

function useUpdateDealer() {
  const axiosInstance = useAxios();
  const queryClient = useQueryClient();

  const updateDealer = async (dealer: Dealer) => {
    return axiosInstance
      .patch<Dealer>(`dealer/${dealer.slug}/`, dealer)
      .then((res) => res.data);
  };

  return useMutation<Dealer, AxiosError<IError>, Dealer, EditDealerContext>({
    mutationFn: updateDealer,
    onMutate: (editingDealer) => {
      const previousDealerList =
        queryClient.getQueryData<Dealer[]>(["dealerList"]) || [];

      const previousDealerSlug = editingDealer.slug;

      queryClient.setQueryData<Dealer[]>(["dealerList"], (dealerList = []) =>
        dealerList.map((dealer) =>
          dealer.id === editingDealer.id ? editingDealer : dealer
        )
      );

      return { previousDealerList, previousDealerSlug };
    },
    onSuccess: (newDealer, _, context) => {
      enqueueSnackbar("Dealer sucessfully Updated", { variant: "success" });

      if (context && context.previousDealerSlug !== newDealer.slug) {
        queryClient.invalidateQueries();
      } else {
        queryClient.setQueryData<Dealer[]>(["dealerList"], (dealerList = []) =>
          dealerList.map((dealer) =>
            dealer.id === newDealer.id ? newDealer : dealer
          )
        );
      }
    },
    onError: (error, _dealer, context) => {
      let errorMessage = "";
      if (error.code === "ERR_NETWORK") {
        errorMessage = error.message;
      } else {
        errorMessage =
          error.response?.data.error ||
          (error.response?.data.errors && error.response?.data.errors[0]) ||
          "Failed to Update Dealer";
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

export default useUpdateDealer;
