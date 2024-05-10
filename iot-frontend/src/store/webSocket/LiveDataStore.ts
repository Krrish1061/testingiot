import { StateCreator } from "zustand";
import ILiveDataStore from "../../entities/webSocket/LiveDataStore";

const liveDataStore: StateCreator<ILiveDataStore> = (set) => ({
  liveData: null,
  setliveDataToNull: () => set({ liveData: null }),

  setLiveData: (liveData) => {
    set((state) => {
      if (state.liveData) {
        const device_id = +Object.keys(liveData)[0];
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
});

export default liveDataStore;
