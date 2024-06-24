import { create } from "zustand";
import MuiDataGrid from "../../entities/MuiDataGrid";
import User from "../../entities/User";
import { storeResetFns } from "../resetAllStore";
import dataGridStoreInitialState from "./dataGridStoreInitialState";

const useUserDataGridStore = create<MuiDataGrid<User>>((set) => {
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

export default useUserDataGridStore;
