import { useEffect } from "react";
import useSensorDataGrid from "../../../hooks/muiDataGrid/useSensorDataGrid";
import useGetAllSensors from "../../../hooks/sensor/useGetAllSensors";
import useSensorDataGridStore from "../../../store/datagrid/sensorDataGridStore";
import ConfirmDialog from "../../datagrid/ConfirmDialog";
import DeleteDialog from "../../datagrid/DeleteDialog";
import Box from "@mui/material/Box";
import BaseMuiGrid from "../../datagrid/BaseMuiGrid";
import SensorColumns from "./SensorColumns";

function DesktopManageSensors() {
  const { data, isError, isSuccess, isLoading } = useGetAllSensors();
  const {
    processRowUpdate,
    handleRowModesModelChange,
    handleDialogYesButton,
    handleDialogNoButton,
    handleDialogDeleteNoButton,
    handleDialogDeleteYesButton,
    handleProcessRowUpdateError,
  } = useSensorDataGrid();

  const rows = useSensorDataGridStore((state) => state.rows);
  const deleteRow = useSensorDataGridStore((state) => state.deleteRow);
  const setRows = useSensorDataGridStore((state) => state.setRows);
  const setRowModesModel = useSensorDataGridStore(
    (state) => state.setRowModesModel
  );
  const rowModesModel = useSensorDataGridStore((state) => state.rowModesModel);
  const promiseArguments = useSensorDataGridStore(
    (state) => state.promiseArguments
  );

  useEffect(() => {
    if (isSuccess && rows.length === 0) {
      console.log(data);
      setRows(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  const columns = SensorColumns();

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
        type="Sensor"
        promiseArguments={promiseArguments}
        handleYesButton={handleDialogYesButton}
        handleNoButton={handleDialogNoButton}
      />
      <DeleteDialog
        handleYesButton={handleDialogDeleteYesButton}
        handleNoButton={handleDialogDeleteNoButton}
        type="Sensor"
        open={!!deleteRow}
        name={deleteRow?.name}
      />
    </>
  );
}

export default DesktopManageSensors;
