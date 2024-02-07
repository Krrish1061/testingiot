import IotDevice from "../../entities/IotDevice";
import useIotDeviceDataGridStore from "../../store/datagrid/iotDeviceDataGridStore";
import useDeleteIotDevice from "../iotDevice/useDeleteIotDevice";
import useUpdateIotDevice from "../iotDevice/useUpdateIotDevice";
import useDataGrid from "./useDataGrid";

function useIotDeviceDataGrid() {
  const { mutateAsync: updateIotDevice } = useUpdateIotDevice();
  const { mutate: deleteIotDevice } = useDeleteIotDevice();
  return useDataGrid<IotDevice>({
    useDataGridStore: useIotDeviceDataGridStore,
    editRow: updateIotDevice,
    deleteRow: deleteIotDevice,
  });
}

export default useIotDeviceDataGrid;
