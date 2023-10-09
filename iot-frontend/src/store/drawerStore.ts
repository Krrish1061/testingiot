import { create } from "zustand";

interface DrawerStore {
  isDrawerOpen: boolean;
  setIsDrawerOpen: () => void;
  resetToDefault: () => void;
}

const useDrawerStore = create<DrawerStore>((set) => ({
  isDrawerOpen: true,
  setIsDrawerOpen: () =>
    set((store) => ({ isDrawerOpen: !store.isDrawerOpen })),
  resetToDefault: () => set(() => ({ isDrawerOpen: false })),
}));

export default useDrawerStore;
