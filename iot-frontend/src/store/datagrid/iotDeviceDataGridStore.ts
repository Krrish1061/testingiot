import { create } from "zustand";
import MuiDataGrid from "../../entities/MuiDataGrid";
import IotDevice from "../../entities/IotDevice";

const useIotDeviceDataGridStore = create<MuiDataGrid<IotDevice>>((set) => ({
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

export default useIotDeviceDataGridStore;
