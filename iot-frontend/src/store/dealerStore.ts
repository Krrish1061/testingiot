import { create } from "zustand";
import IDealerStore from "../entities/zustandStore/DealerStore";
import { storeResetFns } from "./resetAllStore";

const useDealerStore = create<IDealerStore>((set) => {
  storeResetFns.add(() => set({ dealer: null }));
  return {
    dealer: null,
    setDealer: (dealer) => set({ dealer: dealer }),
  };
});

export default useDealerStore;
