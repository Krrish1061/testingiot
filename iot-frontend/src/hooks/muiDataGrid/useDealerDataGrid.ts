import IDealer from "../../entities/Dealer";
import useDealerDataGridStore from "../../store/datagrid/dealerDataGridStore";
import useDeleteDealer from "../dealer/useDeleteDealer";
import useUpdateDealer from "../dealer/useUpdateDealer";

import useDataGrid from "./useDataGrid";

function useDealerDataGrid() {
  const { mutateAsync: updateDealer } = useUpdateDealer();
  const { mutate: deleteDealer } = useDeleteDealer();
  return useDataGrid<IDealer>({
    useDataGridStore: useDealerDataGridStore,
    editRow: updateDealer,
    deleteRow: deleteDealer,
  });
}

export default useDealerDataGrid;
