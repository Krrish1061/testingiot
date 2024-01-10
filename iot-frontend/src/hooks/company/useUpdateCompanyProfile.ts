import { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import CompanyProfile from "../../entities/CompanyProfile";
import useCompanyStore from "../../store/companyStore";
import useAxios from "../../api/axiosInstance";

interface IFormInputs {
  address?: string | null;
  description?: string | null;
  phone_number?: string | null;
  logo?: File;
}

interface IError {
  error: string;
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

  return useMutation<CompanyProfile, AxiosError<IError>, IFormInputs>({
    mutationFn: UpdateCompanyProfile,
    onSuccess(companyProfile) {
      setCompany({ ...company, profile: companyProfile });
    },
    onError: (error) => {
      enqueueSnackbar(
        error.response ? error.response?.data.error : error.message,
        {
          variant: "error",
        }
      );
    },
  });
}

export default useUpdateCompanyProfile;
