import { create } from "zustand";
import IotDevice from "../../entities/IotDevice";
import MuiDataGrid from "../../entities/MuiDataGrid";
import { storeResetFns } from "../resetAllStore";
import dataGridStoreInitialState from "./dataGridStoreInitialState";

const useIotDeviceDataGridStore = create<MuiDataGrid<IotDevice>>((set) => {
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

export default useIotDeviceDataGridStore;
