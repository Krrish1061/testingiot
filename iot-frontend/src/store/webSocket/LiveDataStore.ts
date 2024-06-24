import { StateCreator } from "zustand";
import ILiveDataStore from "../../entities/webSocket/LiveDataStore";
import { storeResetFns } from "../resetAllStore";

const liveDataStore: StateCreator<ILiveDataStore> = (set) => {
  storeResetFns.add(() => set({ liveData: null }));
  return {
    liveData: null,
    setliveDataToNull: () => set({ liveData: null }),

    setLiveData: (liveData) => {
      set((state) => {
        if (state.liveData) {
          const deviceIDArray = Object.keys(liveData);
          if (deviceIDArray.length === 0)
            return {
              ...state,
              liveData: liveData,
            };
          const device_id = +deviceIDArray[0];
          const newData = {
            ...state.liveData[device_id],
            ...liveData[device_id],
          };
          return {
            ...state,
            liveData: {
              ...state.liveData,
              [device_id]: newData,
            },
          };
        } else {
          return {
            ...state,
            liveData: liveData,
          };
        }
      });
    },
  };
};

export default liveDataStore;
