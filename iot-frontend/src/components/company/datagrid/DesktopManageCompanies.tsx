import { useEffect } from "react";
import useGetAllCompany from "../../../hooks/company/useGetAllCompany";
import useCompanyDataGrid from "../../../hooks/muiDataGrid/useCompanyDataGrid";
import useCompanyDataGridStore from "../../../store/datagrid/companyDataGridStore";
import ErrorReload from "../../ErrorReload";
import BaseMuiGrid from "../../datagrid/BaseMuiGrid";
import ConfirmDialog from "../../datagrid/ConfirmDialog";
import DeleteDialog from "../../datagrid/DeleteDialog";
import CompanyColumns from "./CompanyColumns";

function DesktopManageCompanies() {
  const {
    data: companyList,
    isError,
    isSuccess,
    isLoading,
    refetch,
  } = useGetAllCompany();

  const {
    processRowUpdate,
    handleRowModesModelChange,
    handleDialogYesButton,
    handleDialogNoButton,
    handleDialogDeleteNoButton,
    handleDialogDeleteYesButton,
    handleProcessRowUpdateError,
  } = useCompanyDataGrid();

  const rows = useCompanyDataGridStore((state) => state.rows);
  const deleteRow = useCompanyDataGridStore((state) => state.deleteRow);
  const setRows = useCompanyDataGridStore((state) => state.setRows);
  const setRowModesModel = useCompanyDataGridStore(
    (state) => state.setRowModesModel
  );
  const rowModesModel = useCompanyDataGridStore((state) => state.rowModesModel);
  const promiseArguments = useCompanyDataGridStore(
    (state) => state.promiseArguments
  );

  const columns = CompanyColumns();

  useEffect(() => {
    if (isSuccess) {
      setRows(companyList);
    }
  }, [isSuccess, companyList, setRows]);

  if (isError)
    return (
      <ErrorReload
        text="Could not Retrieve the Company List!!!"
        handleRefetch={() => refetch()}
      />
    );
  return (
    <>
      <BaseMuiGrid
        rows={rows}
        columns={columns}
        isLoading={isLoading}
        initialState={{
          columns: {
            columnVisibilityModel: {
              // Hide columns status and traderName, the other columns will remain visible
              serial_number: false,
              created_at: false,
              dealer: false,
            },
          },
          pagination: { paginationModel: { pageSize: 20 } },
        }}
        rowModesModel={rowModesModel}
        slotProps={{
          toolbar: { setRows, setRowModesModel },
        }}
        processRowUpdate={processRowUpdate}
        handleRowModesModelChange={handleRowModesModelChange}
        handleProcessRowUpdateError={handleProcessRowUpdateError}
      />
      <ConfirmDialog
        type="Company"
        promiseArguments={promiseArguments}
        handleYesButton={handleDialogYesButton}
        handleNoButton={handleDialogNoButton}
      />
      <DeleteDialog
        handleYesButton={handleDialogDeleteYesButton}
        handleNoButton={handleDialogDeleteNoButton}
        type="Company"
        open={!!deleteRow}
        name={deleteRow?.name}
      />
    </>
  );
}

export default DesktopManageCompanies;
