import { useEffect } from "react";
import useGetAllIotDevice from "../../../hooks/iotDevice/useGetAllIotDevice";
import useIotDeviceDataGrid from "../../../hooks/muiDataGrid/useIotDeviceDataGrid";
import useIotDeviceDataGridStore from "../../../store/datagrid/iotDeviceDataGridStore";
import ErrorReload from "../../ErrorReload";
import BaseMuiGrid from "../../datagrid/BaseMuiGrid";
import ConfirmDialog from "../../datagrid/ConfirmDialog";
import DeleteDialog from "../../datagrid/DeleteDialog";
import IotDeviceColumns from "./IotDeviceColumns";
import IotDeviceToolBar from "./IotDeviceToolBar";

function DesktopManageIotDevice() {
  const {
    data: iotDeviceList,
    isError,
    isSuccess,
    isLoading,
    refetch,
  } = useGetAllIotDevice();
  const {
    processRowUpdate,
    handleRowModesModelChange,
    handleDialogYesButton,
    handleDialogNoButton,
    handleDialogDeleteNoButton,
    handleDialogDeleteYesButton,
    handleProcessRowUpdateError,
  } = useIotDeviceDataGrid();

  const rows = useIotDeviceDataGridStore((state) => state.rows);
  const deleteRow = useIotDeviceDataGridStore((state) => state.deleteRow);
  const setRows = useIotDeviceDataGridStore((state) => state.setRows);
  const setRowModesModel = useIotDeviceDataGridStore(
    (state) => state.setRowModesModel
  );
  const rowModesModel = useIotDeviceDataGridStore(
    (state) => state.rowModesModel
  );
  const promiseArguments = useIotDeviceDataGridStore(
    (state) => state.promiseArguments
  );

  useEffect(() => {
    if (isSuccess) {
      setRows(iotDeviceList);
    }
  }, [iotDeviceList, isSuccess, setRows]);

  const columns = IotDeviceColumns();

  if (isError)
    return (
      <ErrorReload
        text="Could not Retrieve the Iot Device List!!!"
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
              id: false,
            },
          },
          pagination: { paginationModel: { pageSize: 20 } },
        }}
        rowModesModel={rowModesModel}
        customToolbar={IotDeviceToolBar}
        slotProps={{
          toolbar: { setRows, setRowModesModel },
        }}
        processRowUpdate={processRowUpdate}
        handleRowModesModelChange={handleRowModesModelChange}
        handleProcessRowUpdateError={handleProcessRowUpdateError}
      />
      <ConfirmDialog
        type="IotDevice"
        promiseArguments={promiseArguments}
        handleYesButton={handleDialogYesButton}
        handleNoButton={handleDialogNoButton}
      />
      <DeleteDialog
        handleYesButton={handleDialogDeleteYesButton}
        handleNoButton={handleDialogDeleteNoButton}
        type="IotDevice"
        open={!!deleteRow}
        name={deleteRow?.id}
      />
    </>
  );
}

export default DesktopManageIotDevice;
