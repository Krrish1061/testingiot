import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { enqueueSnackbar } from "notistack";
import useAxios from "../../api/axiosInstance";
import Company from "../../entities/Company";

interface EditCompanyContext {
  previousCompanyList: Company[];
  previousCompanySlug: string;
}

interface IError {
  error?: string;
  errors?: string;
  name?: string[];
}

function useEditCompany() {
  const axiosInstance = useAxios();
  const queryClient = useQueryClient();

  const editCompany = async (company: Company) => {
    return axiosInstance
      .patch<Company>(`company/${company.slug}/`, company)
      .then((res) => res.data);
  };

  return useMutation<Company, AxiosError<IError>, Company, EditCompanyContext>({
    mutationFn: editCompany,
    onMutate: (editingCompany) => {
      const previousCompanyList =
        queryClient.getQueryData<Company[]>(["companyList"]) || [];

      const previousCompanySlug = editingCompany.slug;

      queryClient.setQueryData<Company[]>(["companyList"], (companies = []) =>
        companies.map((company) =>
          company.slug === editingCompany.slug ? editingCompany : company
        )
      );

      return { previousCompanyList, previousCompanySlug };
    },
    onSuccess: (newCompany, _, context) => {
      enqueueSnackbar("Company sucessfully Edited", { variant: "success" });

      if (context && context.previousCompanySlug !== newCompany.slug) {
        queryClient.invalidateQueries();
      } else {
        queryClient.setQueryData<Company[]>(["companyList"], (companies) =>
          companies?.map((company) =>
            company.id === newCompany.id ? newCompany : company
          )
        );
      }
    },
    onError: (error, _editedCompany, context) => {
      let errorMessage = "";
      if (error.code === "ERR_NETWORK") {
        errorMessage = error.message;
      } else {
        errorMessage =
          error.response?.data.error ||
          (error.response?.data.errors && error.response?.data.errors[0]) ||
          (error.response?.data.name && error.response?.data.name[0]) ||
          "Failed to Edit Company";
      }
      enqueueSnackbar(errorMessage, {
        variant: "error",
      });

      if (!context) return;
      queryClient.setQueryData<Company[]>(
        ["companyList"],
        context.previousCompanyList
      );
    },
  });
}

export default useEditCompany;
