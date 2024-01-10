import { useEffect } from "react";
import useGetAllCompany from "../../../hooks/company/useGetAllCompany";
import useCompanyDataGrid from "../../../hooks/muiDataGrid/useCompanyDataGrid";
import useCompanyDataGridStore from "../../../store/datagrid/companyDataGridStore";
import CompanyColumns from "./CompanyColumns";
import Box from "@mui/material/Box";
import DeleteDialog from "../../datagrid/DeleteDialog";
import ConfirmDialog from "../../datagrid/ConfirmDialog";
import BaseMuiGrid from "../../datagrid/BaseMuiGrid";

function DesktopManageCompanies() {
  const { data, isError, isSuccess, isLoading } = useGetAllCompany();

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
    if (isSuccess && rows.length === 0) {
      setRows(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  if (isError) return <Box>Error Ocurred</Box>;
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
