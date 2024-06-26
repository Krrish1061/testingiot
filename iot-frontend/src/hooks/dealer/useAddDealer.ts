import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { enqueueSnackbar } from "notistack";
import useAxios from "../../api/axiosInstance";
import IDealer from "../../entities/Dealer";
import slugify from "../../utilis/slugifyName";

interface IFormInputs {
  email: string;
  name: string;
  user_company_limit: number;
}

interface IError {
  errors?: string[];
  error?: string;
  name?: string[];
  email?: string[];
}

interface AddDealerContext {
  previousDealerList: IDealer[];
  newDealerId: number;
}

function useAddDealer() {
  const axiosInstance = useAxios();
  const queryClient = useQueryClient();

  const addDealer = async (data: IFormInputs) =>
    axiosInstance.post<IDealer>("dealer/", data).then((res) => res.data);

  return useMutation<
    IDealer,
    AxiosError<IError>,
    IFormInputs,
    AddDealerContext
  >({
    mutationFn: addDealer,
    onMutate: (formInputs: IFormInputs) => {
      const previousDealerList =
        queryClient.getQueryData<IDealer[]>(["dealerList"]) || [];

      const newDealerId = Math.floor(Math.random() * 9000) + 1000;

      const newdealer: IDealer = {
        ...formInputs,
        id: newDealerId,
        slug: slugify(formInputs.name),
        created_at: Date.now().toLocaleString(),
      };

      queryClient.setQueryData<IDealer[]>(["dealerList"], (dealer = []) => [
        ...dealer,
        newdealer,
      ]);

      return { previousDealerList, newDealerId };
    },
    onSuccess: (newDealer, _formsInputs, context) => {
      enqueueSnackbar("Dealer sucessfully Created", { variant: "success" });
      if (!context) return;
      queryClient.setQueryData<IDealer[]>(["dealerList"], (dealers) =>
        dealers?.map((dealer) =>
          dealer.id === context.newDealerId ? newDealer : dealer
        )
      );
    },
    onError: (error, _formsInputs, context) => {
      let errorMessage = "";
      if (error.code === "ERR_NETWORK") {
        errorMessage = error.message;
      } else {
        errorMessage =
          error.response?.data.error ||
          (error.response?.data.errors && error.response?.data.errors[0]) ||
          (error.response?.data.email && error.response.data.email[0]) ||
          (error.response?.data.name && error.response.data.name[0]) ||
          "Failed to Create Dealer";
      }
      enqueueSnackbar(errorMessage, {
        variant: "error",
      });

      if (!context) return;
      queryClient.setQueryData<IDealer[]>(
        ["dealerList"],
        context.previousDealerList
      );
    },
  });
}

export default useAddDealer;
