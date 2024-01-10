import Company from "../../entities/Company";
import useCompanyDataGridStore from "../../store/datagrid/companyDataGridStore";
import useDeleteCompany from "../company/useDeleteCompany";
import useEditCompany from "../company/useEditCompany";
import useDataGrid from "./useDataGrid";

function useCompanyDataGrid() {
  const { mutateAsync: editCompany } = useEditCompany();
  const { mutate: deleteCompany } = useDeleteCompany();
  return useDataGrid<Company>({
    useDataGridStore: useCompanyDataGridStore,
    editRow: editCompany,
    deleteRow: deleteCompany,
  });
}

export default useCompanyDataGrid;
