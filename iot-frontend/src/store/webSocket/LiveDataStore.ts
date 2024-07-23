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

          const updatedLiveData = { ...state.liveData };
          deviceIDArray.forEach((deviceID) => {
            const device_id = +deviceID;
            const newData = {
              ...updatedLiveData[device_id],
              ...liveData[device_id],
            };
            updatedLiveData[device_id] = newData;
          });

          return {
            ...state,
            liveData: updatedLiveData,
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
