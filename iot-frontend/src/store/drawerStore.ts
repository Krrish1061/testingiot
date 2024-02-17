import { create } from "zustand";

interface DrawerStore {
  isDrawerOpen: boolean;
  isMobile: boolean;
  toggleDrawerOpen: () => void;
  setDrawerOpen: (drawerState: boolean) => void;
  setIsMobile: (drawerState: boolean) => void;
}

const useDrawerStore = create<DrawerStore>((set) => ({
  isDrawerOpen: false,
  isMobile: false,
  toggleDrawerOpen: () =>
    set((store) => ({ isDrawerOpen: !store.isDrawerOpen })),
  setDrawerOpen: (drawerState) => set(() => ({ isDrawerOpen: drawerState })),
  setIsMobile: (isMobile) => set(() => ({ isMobile: isMobile })),
}));

export default useDrawerStore;
