import { create } from "zustand";
import IDealer from "../../entities/Dealer";
import MuiDataGrid from "../../entities/MuiDataGrid";
import { storeResetFns } from "../resetAllStore";
import dataGridStoreInitialState from "./dataGridStoreInitialState";

const useDealerDataGridStore = create<MuiDataGrid<IDealer>>((set) => {
  storeResetFns.add(() => set(dataGridStoreInitialState));
  return {
    ...dataGridStoreInitialState,
    setDeleteRow: (row) => set({ deleteRow: row }),
    setRows: (rows) => set({ rows: rows }),
    setRowModesModel: (rowModesModel) => set({ rowModesModel: rowModesModel }),
    setPromiseArguments: (promiseArguments) =>
      set({ promiseArguments: promiseArguments }),
  };
});

export default useDealerDataGridStore;
