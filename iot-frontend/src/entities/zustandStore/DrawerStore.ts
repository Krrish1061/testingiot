interface IDrawerStore {
  isDrawerOpen: boolean;
  isMobile: boolean;
  toggleDrawerOpen: () => void;
  setDrawerOpen: (drawerState: boolean) => void;
  setIsMobile: (drawerState: boolean) => void;
}

export default IDrawerStore;
