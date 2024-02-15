import SendLiveData from "../../entities/SendLiveData";
import useSendLiveDataDataGridStore from "../../store/datagrid/sendLiveDataDataGrid";
import useDeleteSendLiveData from "../sendLiveData/useDeleteSendLiveData";
import useEditSendLiveData from "../sendLiveData/useEditSendLiveData";
import useDataGrid from "./useDataGrid";

function useSendLiveDataDataGrid() {
  const { mutateAsync: editSendLiveData } = useEditSendLiveData();
  const { mutate: deleteSendLiveData } = useDeleteSendLiveData();
  return useDataGrid<SendLiveData>({
    useDataGridStore: useSendLiveDataDataGridStore,
    editRow: editSendLiveData,
    deleteRow: deleteSendLiveData,
  });
}

export default useSendLiveDataDataGrid;
