import { create } from "zustand";
import MuiDataGrid from "../../entities/MuiDataGrid";
import Company from "../../entities/Company";

const useCompanyDataGridStore = create<MuiDataGrid<Company>>((set) => ({
  rows: [],
  rowModesModel: {},
  promiseArguments: null,
  deleteRow: null,
  setDeleteRow: (row) => set({ deleteRow: row }),
  setRows: (rows) => set({ rows: rows }),
  setRowModesModel: (rowModesModel) => set({ rowModesModel: rowModesModel }),
  setPromiseArguments: (promiseArguments) =>
    set({ promiseArguments: promiseArguments }),
}));

export default useCompanyDataGridStore;
