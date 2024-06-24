import { create } from "zustand";
import IDrawerStore from "../entities/zustandStore/DrawerStore";
import { storeResetFns } from "./resetAllStore";

const initialDrawerState = {
  isDrawerOpen: false,
  isMobile: false,
};

const useDrawerStore = create<IDrawerStore>((set) => {
  storeResetFns.add(() => set(initialDrawerState));
  return {
    ...initialDrawerState,
    toggleDrawerOpen: () =>
      set((store) => ({ isDrawerOpen: !store.isDrawerOpen })),
    setDrawerOpen: (drawerState) => set(() => ({ isDrawerOpen: drawerState })),
    setIsMobile: (isMobile) => set(() => ({ isMobile: isMobile })),
  };
});

export default useDrawerStore;
