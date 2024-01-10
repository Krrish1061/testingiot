import { useMutation } from "@tanstack/react-query";
import useAxios from "../../api/axiosInstance";
import Company from "../../entities/Company";
import { AxiosError } from "axios";
import { enqueueSnackbar } from "notistack";

function useEditCompany() {
  const axiosInstance = useAxios();

  const editCompany = async (company: Company) => {
    return axiosInstance
      .patch<Company>(`company/${company.slug}/`, company)
      .then((res) => res.data);
  };

  return useMutation<Company, AxiosError, Company>({
    mutationFn: editCompany,
    onSuccess: () => {
      enqueueSnackbar("Company sucessfully Edited", { variant: "success" });
    },
    onError: () => {
      enqueueSnackbar("Company modification failed", { variant: "error" });
    },
  });
}

export default useEditCompany;
