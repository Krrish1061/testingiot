import { create } from "zustand";
import User from "../entities/User";
import MuiDataGrid from "../entities/MuiDataGrid";

const useUserDataGridStore = create<MuiDataGrid<User>>((set) => ({
  rows: [],
  rowModesModel: {},
  promiseArguments: null,
  setRows: (rows) => set({ rows: rows }),
  setRowModesModel: (rowModesModel) => set({ rowModesModel: rowModesModel }),
  setPromiseArguments: (promiseArguments) =>
    set({ promiseArguments: promiseArguments }),
}));

export default useUserDataGridStore;
