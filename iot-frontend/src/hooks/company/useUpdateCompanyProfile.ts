import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { enqueueSnackbar } from "notistack";
import useAxios from "../../api/axiosInstance";
import Company from "../../entities/Company";
import CompanyProfile from "../../entities/CompanyProfile";
import useCompanyStore from "../../store/companyStore";

interface IFormInputs {
  address?: string | null;
  description?: string | null;
  phone_number?: string | null;
}

interface ChangeCompanyProfileContext {
  previousCompany: Company;
}

interface IError {
  error: string;
  phone_number: string[];
}

function useUpdateCompanyProfile() {
  const axiosInstance = useAxios();
  const company = useCompanyStore((state) => state.company);
  const setCompany = useCompanyStore((state) => state.setCompany);
  const queryClient = useQueryClient();

  const UpdateCompanyProfile = async (data: IFormInputs) =>
    axiosInstance
      .patch<CompanyProfile>(`company/${company.slug}/profile/`, data)
      .then((res) => res.data);

  return useMutation<
    CompanyProfile,
    AxiosError<IError>,
    IFormInputs,
    ChangeCompanyProfileContext
  >({
    mutationFn: UpdateCompanyProfile,
    onMutate: (newCompanyProfile) => {
      const previousCompany = company;

      const newProfile: CompanyProfile = {
        ...company?.profile,
        ...newCompanyProfile,
      } as CompanyProfile;

      setCompany({ ...company, profile: newProfile });

      queryClient.setQueryData<Company>(
        ["company", company.slug],
        (cachedCompany = {} as Company) => ({
          ...cachedCompany,
          profile: newProfile,
        })
      );

      return { previousCompany };
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
      setCompany(context.previousCompany);
      queryClient.setQueryData<Company>(
        ["company", company.slug],
        context.previousCompany
      );
    },
  });
}

export default useUpdateCompanyProfile;
