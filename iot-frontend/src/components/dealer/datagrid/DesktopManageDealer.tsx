import { useEffect } from "react";
import useGetAllDealer from "../../../hooks/dealer/useGetAllDealer";
import useDealerDataGrid from "../../../hooks/muiDataGrid/useDealerDataGrid";
import useDealerDataGridStore from "../../../store/datagrid/dealerDataGridStore";
import ErrorReload from "../../ErrorReload";
import BaseMuiGrid from "../../datagrid/BaseMuiGrid";
import ConfirmDialog from "../../datagrid/ConfirmDialog";
import DeleteDialog from "../../datagrid/DeleteDialog";
import DealerColumns from "./DealerColumns";

function DesktopManageDealer() {
  const {
    data: dealerList,
    isError,
    isSuccess,
    isLoading,
    refetch,
  } = useGetAllDealer();

  const {
    processRowUpdate,
    handleRowModesModelChange,
    handleDialogYesButton,
    handleDialogNoButton,
    handleDialogDeleteNoButton,
    handleDialogDeleteYesButton,
    handleProcessRowUpdateError,
  } = useDealerDataGrid();

  const rows = useDealerDataGridStore((state) => state.rows);
  const deleteRow = useDealerDataGridStore((state) => state.deleteRow);
  const setRows = useDealerDataGridStore((state) => state.setRows);
  const setRowModesModel = useDealerDataGridStore(
    (state) => state.setRowModesModel
  );
  const rowModesModel = useDealerDataGridStore((state) => state.rowModesModel);
  const promiseArguments = useDealerDataGridStore(
    (state) => state.promiseArguments
  );

  useEffect(() => {
    if (isSuccess) {
      setRows(dealerList);
    }
  }, [dealerList, isSuccess, setRows]);

  const columns = DealerColumns();

  if (isError)
    return (
      <ErrorReload
        text="Could not Retrieve the Dealer List!!!"
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
        type="Dealer"
        promiseArguments={promiseArguments}
        handleYesButton={handleDialogYesButton}
        handleNoButton={handleDialogNoButton}
      />
      <DeleteDialog
        handleYesButton={handleDialogDeleteYesButton}
        handleNoButton={handleDialogDeleteNoButton}
        type="Dealer"
        open={!!deleteRow}
        name={deleteRow?.name}
      />
    </>
  );
}

export default DesktopManageDealer;
