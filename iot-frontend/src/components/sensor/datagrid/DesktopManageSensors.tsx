import { useEffect } from "react";
import useSensorDataGrid from "../../../hooks/muiDataGrid/useSensorDataGrid";
import useGetAllSensors from "../../../hooks/sensor/useGetAllSensors";
import useSensorDataGridStore from "../../../store/datagrid/sensorDataGridStore";
import ErrorReload from "../../ErrorReload";
import BaseMuiGrid from "../../datagrid/BaseMuiGrid";
import ConfirmDialog from "../../datagrid/ConfirmDialog";
import DeleteDialog from "../../datagrid/DeleteDialog";
import SensorColumns from "./SensorColumns";
import SensorToolBar from "./SensorToolBar";

function DesktopManageSensors() {
  const {
    data: sensorList,
    isError,
    isSuccess,
    isLoading,
    refetch,
  } = useGetAllSensors();
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
    if (isSuccess) {
      setRows(sensorList);
    }
  }, [sensorList, isSuccess, setRows]);

  const columns = SensorColumns();

  if (isError)
    return (
      <ErrorReload
        text="Could not Retrieve the Sensors List!!!"
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
          pagination: { paginationModel: { pageSize: 20 } },
        }}
        rowModesModel={rowModesModel}
        customToolbar={SensorToolBar}
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
