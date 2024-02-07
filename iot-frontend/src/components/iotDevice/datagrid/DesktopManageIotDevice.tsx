import { useEffect } from "react";
import useGetAllIotDevice from "../../../hooks/iotDevice/useGetAllIotDevice";
import useIotDeviceDataGrid from "../../../hooks/muiDataGrid/useIotDeviceDataGrid";
import useIotDeviceDataGridStore from "../../../store/datagrid/iotDeviceDataGridStore";
import ConfirmDialog from "../../datagrid/ConfirmDialog";
import DeleteDialog from "../../datagrid/DeleteDialog";
import IotDeviceColumns from "./IotDeviceColumns";
import Box from "@mui/material/Box";
import BaseMuiGrid from "../../datagrid/BaseMuiGrid";

function DesktopManageIotDevice() {
  const { data, isError, isSuccess, isLoading } = useGetAllIotDevice();
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
    if (isSuccess && rows.length === 0) {
      setRows(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  const columns = IotDeviceColumns();

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
