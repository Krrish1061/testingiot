import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxios from "../../api/axiosInstance";
import Company from "../../entities/Company";
import { enqueueSnackbar } from "notistack";
import useCompanyDataGridStore from "../../store/datagrid/companyDataGridStore";
import { AxiosError, AxiosResponse } from "axios";

interface DeleteCompanyContext {
  previousCompanyList: Company[];
}

interface IError {
  error: string;
}

function useDeleteCompany() {
  const axiosInstance = useAxios();
  const rows = useCompanyDataGridStore((state) => state.rows);
  const setRows = useCompanyDataGridStore((state) => state.setRows);
  const queryClient = useQueryClient();

  const deleteCompany = async (company: Company) => {
    return axiosInstance.delete(`company/${company.slug}/`);
  };

  return useMutation<
    AxiosResponse,
    AxiosError<IError>,
    Company,
    DeleteCompanyContext
  >({
    mutationFn: deleteCompany,
    onMutate: (deletingCompany) => {
      const previousCompanyList =
        queryClient.getQueryData<Company[]>(["companyList"]) || [];

      queryClient.setQueryData<Company[]>(["companyList"], (companies = []) =>
        companies.filter((company) => company.slug !== deletingCompany.slug)
      );

      return { previousCompanyList };
    },
    onSuccess: () => {
      enqueueSnackbar("Company sucessfully Deleted", { variant: "success" });
    },
    onError: (error, company, context) => {
      // reverting to the old rows here company is the company to be deleted
      setRows([...rows, company]);
      let errorMessage = "";
      if (error.code === "ERR_NETWORK") {
        errorMessage = error.message;
      } else {
        errorMessage = error.response?.data.error || "Company Deletion failed";
      }
      enqueueSnackbar(errorMessage, { variant: "error" });
      if (!context) return;
      queryClient.setQueryData<Company[]>(
        ["companyList"],
        context.previousCompanyList
      );
    },
  });
}

export default useDeleteCompany;
