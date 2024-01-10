import Sensor from "../../entities/Sensor";
import useSensorDataGridStore from "../../store/datagrid/sensorDataGridStore";
import useDeleteSensor from "../sensor/useDeleteSensor";
import useEditSensor from "../sensor/useEditSensor";
import useDataGrid from "./useDataGrid";

function useSensorDataGrid() {
  const { mutateAsync: editSensor } = useEditSensor();
  const { mutate: deleteSensor } = useDeleteSensor();
  return useDataGrid<Sensor>({
    useDataGridStore: useSensorDataGridStore,
    editRow: editSensor,
    deleteRow: deleteSensor,
  });
}

export default useSensorDataGrid;
