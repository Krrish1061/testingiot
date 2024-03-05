import { useMutation } from "@tanstack/react-query";
import useAxios from "../../api/axiosInstance";
import Company from "../../entities/Company";
import { enqueueSnackbar } from "notistack";
import useCompanyDataGridStore from "../../store/datagrid/companyDataGridStore";
import { AxiosError } from "axios";

function useDeleteCompany() {
  const axiosInstance = useAxios();
  const rows = useCompanyDataGridStore((state) => state.rows);
  const setRows = useCompanyDataGridStore((state) => state.setRows);

  const deleteCompany = async (company: Company) => {
    return axiosInstance.delete(`company/${company.slug}/`);
  };

  return useMutation({
    mutationFn: deleteCompany,
    onSuccess: () => {
      enqueueSnackbar("Company sucessfully Deleted", { variant: "success" });
    },
    onError: (_error: AxiosError, company) => {
      // reverting to the old rows here company is the company to be deleted
      setRows([...rows, company]);
      enqueueSnackbar("Company Deletion failed", { variant: "error" });
    },
  });
}

export default useDeleteCompany;
