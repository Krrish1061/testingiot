import { AxiosError } from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import CompanyProfile from "../../entities/CompanyProfile";
import useCompanyStore from "../../store/companyStore";
import useAxios from "../../api/axiosInstance";
import Company from "../../entities/Company";

interface IFormInputs {
  logo: File;
}

interface IError {
  error: string;
  logo?: string[];
}

function useUpdateCompanyLogo() {
  const axiosInstance = useAxios();
  const company = useCompanyStore((state) => state.company);
  const setCompany = useCompanyStore((state) => state.setCompany);
  const queryClient = useQueryClient();

  const UpdateCompanyProfile = async (data: IFormInputs) =>
    axiosInstance
      .patch<CompanyProfile>(`company/${company.slug}/profile/`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => res.data);

  return useMutation<CompanyProfile, AxiosError<IError>, IFormInputs>({
    mutationFn: UpdateCompanyProfile,

    onSuccess(companyProfile) {
      setCompany({
        ...company,
        profile: companyProfile,
      });

      queryClient.setQueryData<Company>(
        ["company", company.slug],
        (cachedCompany = {} as Company) => ({
          ...cachedCompany,
          profile: companyProfile,
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
          "Failed to update Company Logo";
      }
      enqueueSnackbar(errorMessage, {
        variant: "error",
      });
    },
  });
}

export default useUpdateCompanyLogo;
