import { create } from "zustand";

interface DrawerStore {
  isDrawerOpen: boolean;
  toggleDrawerOpen: () => void;
  setDrawerOpen: (drawerState: boolean) => void;
}

const useDrawerStore = create<DrawerStore>((set) => ({
  isDrawerOpen: false,
  toggleDrawerOpen: () =>
    set((store) => ({ isDrawerOpen: !store.isDrawerOpen })),
  setDrawerOpen: (drawerState) => set(() => ({ isDrawerOpen: drawerState })),
}));

export default useDrawerStore;
