import { create } from "zustand";
import Company from "../../entities/Company";
import MuiDataGrid from "../../entities/MuiDataGrid";
import { storeResetFns } from "../resetAllStore";
import dataGridStoreInitialState from "./dataGridStoreInitialState";

const useCompanyDataGridStore = create<MuiDataGrid<Company>>((set) => {
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

export default useCompanyDataGridStore;
