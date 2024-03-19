import { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import CompanyProfile from "../../entities/CompanyProfile";
import useCompanyStore from "../../store/companyStore";
import useAxios from "../../api/axiosInstance";
import Company from "../../entities/Company";

interface IFormInputs {
  address?: string | null;
  description?: string | null;
  phone_number?: string | null;
  logo?: File;
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

  const UpdateCompanyProfile = async (data: IFormInputs) => {
    const headers = data.logo ? { "Content-Type": "multipart/form-data" } : {};

    return axiosInstance
      .patch<CompanyProfile>(`company/${company.slug}/profile/`, data, {
        headers,
      })
      .then((res) => res.data);
  };

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
    },
  });
}

export default useUpdateCompanyProfile;
