import { useEffect } from "react";
import useSendLiveDataDataGrid from "../../../hooks/muiDataGrid/useSendLiveDataDataGrid";
import useGetAllSendLiveData from "../../../hooks/sendLiveData/useGetAllSendLiveData";
import useSendLiveDataDataGridStore from "../../../store/datagrid/sendLiveDataDataGrid";
import ErrorReload from "../../ErrorReload";
import BaseMuiGrid from "../../datagrid/BaseMuiGrid";
import ConfirmDialog from "../../datagrid/ConfirmDialog";
import DeleteDialog from "../../datagrid/DeleteDialog";
import SendLiveDataColumns from "./SendLiveDataColumns";
import SendLiveDataToolBar from "./SendLiveDataToolBar";

function DesktopSendLiveData() {
  const {
    data: sendLiveDataList,
    isError,
    isSuccess,
    isLoading,
    refetch,
  } = useGetAllSendLiveData();
  const {
    processRowUpdate,
    handleRowModesModelChange,
    handleDialogYesButton,
    handleDialogNoButton,
    handleDialogDeleteNoButton,
    handleDialogDeleteYesButton,
    handleProcessRowUpdateError,
  } = useSendLiveDataDataGrid();

  const rows = useSendLiveDataDataGridStore((state) => state.rows);
  const deleteRow = useSendLiveDataDataGridStore((state) => state.deleteRow);
  const setRows = useSendLiveDataDataGridStore((state) => state.setRows);
  const setRowModesModel = useSendLiveDataDataGridStore(
    (state) => state.setRowModesModel
  );
  const rowModesModel = useSendLiveDataDataGridStore(
    (state) => state.rowModesModel
  );
  const promiseArguments = useSendLiveDataDataGridStore(
    (state) => state.promiseArguments
  );

  useEffect(() => {
    if (isSuccess) {
      setRows(sendLiveDataList);
    }
  }, [isSuccess, sendLiveDataList, setRows]);

  const columns = SendLiveDataColumns();

  if (isError)
    return (
      <ErrorReload
        text="Could not Retrieve the SendLive Data List!!!"
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
            },
          },
          pagination: { paginationModel: { pageSize: 20 } },
        }}
        rowModesModel={rowModesModel}
        customToolbar={SendLiveDataToolBar}
        slotProps={{
          toolbar: { setRows, setRowModesModel },
        }}
        processRowUpdate={processRowUpdate}
        handleRowModesModelChange={handleRowModesModelChange}
        handleProcessRowUpdateError={handleProcessRowUpdateError}
      />
      <ConfirmDialog
        type="Endpoint"
        promiseArguments={promiseArguments}
        handleYesButton={handleDialogYesButton}
        handleNoButton={handleDialogNoButton}
      />
      <DeleteDialog
        handleYesButton={handleDialogDeleteYesButton}
        handleNoButton={handleDialogDeleteNoButton}
        type="Endpoint which belongs to"
        open={!!deleteRow}
        name={deleteRow?.user || deleteRow?.company}
      />
    </>
  );
}

export default DesktopSendLiveData;
