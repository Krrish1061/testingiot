import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { enqueueSnackbar } from "notistack";
import useAxios from "../../api/axiosInstance";
import IDealer from "../../entities/Dealer";
import IDealerProfile from "../../entities/DealerProfile";
import useDealerStore from "../../store/dealerStore";

interface IFormInputs {
  address?: string | null;
  description?: string | null;
  phone_number?: string | null;
}

interface ChangeDealerProfileContext {
  previousDealer: IDealer | null;
}

interface IError {
  error: string;
  phone_number: string[];
}

function useUpdateDealerProfile() {
  const axiosInstance = useAxios();
  const dealer = useDealerStore((state) => state.dealer);
  const setDealer = useDealerStore((state) => state.setDealer);
  const queryClient = useQueryClient();

  const UpdateDealerProfile = async (data: IFormInputs) =>
    axiosInstance
      .patch<IDealerProfile>(`dealer/${dealer?.slug}/profile/`, data)
      .then((res) => res.data);

  return useMutation<
    IDealerProfile,
    AxiosError<IError>,
    IFormInputs,
    ChangeDealerProfileContext
  >({
    mutationFn: UpdateDealerProfile,
    onMutate: (newDealerProfile) => {
      const previousDealer = dealer;
      if (dealer) {
        const newProfile: IDealerProfile = {
          ...dealer.profile,
          ...newDealerProfile,
        } as IDealerProfile;

        setDealer({ ...dealer, profile: newProfile });

        queryClient.setQueryData<IDealer>(
          ["dealer"],
          (cachedDealer = {} as IDealer) => ({
            ...cachedDealer,
            profile: newProfile,
          })
        );
      }

      return { previousDealer };
    },
    onSuccess() {
      enqueueSnackbar("Profile Updated", {
        variant: "success",
      });
    },
    onError: (error, _formsInputs, context) => {
      let errorMessage = "";
      if (error.code === "ERR_NETWORK") {
        errorMessage = error.message;
      } else {
        errorMessage =
          error.response?.data.error ||
          (error.response?.data.phone_number &&
            error.response?.data.phone_number[0]) ||
          "Failed to Update Profile";
      }
      enqueueSnackbar(errorMessage, {
        variant: "error",
      });

      if (!context) return;
      setDealer(context.previousDealer);
      if (context.previousDealer)
        queryClient.setQueryData<IDealer>(["dealer"], context.previousDealer);
    },
  });
}

export default useUpdateDealerProfile;
