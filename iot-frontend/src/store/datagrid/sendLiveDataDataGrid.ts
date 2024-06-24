import { create } from "zustand";
import MuiDataGrid from "../../entities/MuiDataGrid";
import SendLiveData from "../../entities/SendLiveData";
import { storeResetFns } from "../resetAllStore";
import dataGridStoreInitialState from "./dataGridStoreInitialState";

const useSendLiveDataDataGridStore = create<MuiDataGrid<SendLiveData>>(
  (set) => {
    storeResetFns.add(() => set(dataGridStoreInitialState));
    return {
      ...dataGridStoreInitialState,
      setDeleteRow: (row) => set({ deleteRow: row }),
      setRows: (rows) => set({ rows: rows }),
      setRowModesModel: (rowModesModel) =>
        set({ rowModesModel: rowModesModel }),
      setPromiseArguments: (promiseArguments) =>
        set({ promiseArguments: promiseArguments }),
    };
  }
);

export default useSendLiveDataDataGridStore;
