import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { enqueueSnackbar } from "notistack";
import useAxios from "../../api/axiosInstance";
import IDealer from "../../entities/Dealer";
import IDealerProfile from "../../entities/DealerProfile";
import useDealerStore from "../../store/dealerStore";

interface IFormInputs {
  logo: File;
}

interface IError {
  error: string;
  logo?: string[];
}

function useUpdateDealerLogo() {
  const axiosInstance = useAxios();
  const dealer = useDealerStore((state) => state.dealer);
  const setDealer = useDealerStore((state) => state.setDealer);
  const queryClient = useQueryClient();

  const UpdateDealerProfile = async (data: IFormInputs) =>
    axiosInstance
      .patch<IDealerProfile>(`dealer/${dealer?.slug}/profile/`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => res.data);

  return useMutation<IDealerProfile, AxiosError<IError>, IFormInputs>({
    mutationFn: UpdateDealerProfile,

    onSuccess(dealerProfile) {
      if (dealer)
        setDealer({
          ...dealer,
          profile: dealerProfile,
        });

      queryClient.setQueryData<IDealer>(
        ["dealer"],
        (cachedDealer = {} as IDealer) => ({
          ...cachedDealer,
          profile: dealerProfile,
        })
      );
      enqueueSnackbar("Profile Updated", {
        variant: "success",
      });
    },
    onError: (error) => {
      let errorMessage = "";
      if (error.code === "ERR_NETWORK") {
        errorMessage = error.message;
      } else {
        errorMessage =
          error.response?.data.error ||
          (error.response?.data.logo && error.response?.data.logo[0]) ||
          "Failed to Update Dealer Logo";
      }
      enqueueSnackbar(errorMessage, {
        variant: "error",
      });
    },
  });
}

export default useUpdateDealerLogo;
