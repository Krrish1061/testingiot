import { create } from "zustand";
import MuiDataGrid from "../../entities/MuiDataGrid";
import Sensor from "../../entities/Sensor";
import { storeResetFns } from "../resetAllStore";
import dataGridStoreInitialState from "./dataGridStoreInitialState";

const useSensorDataGridStore = create<MuiDataGrid<Sensor>>((set) => {
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

export default useSensorDataGridStore;
