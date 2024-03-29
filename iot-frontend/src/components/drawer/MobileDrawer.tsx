import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import DrawerList from "./DrawerList";
import DrawerHeader from "./DrawerHeader";
import useDrawerStore from "../../store/drawerStore";

const drawerWidth = 240;
const iOS =
  typeof navigator !== "undefined" &&
  /iPad|iPhone|iPod/.test(navigator.userAgent);

function SwipeableMobileDrawer() {
  const isDrawerOpen = useDrawerStore((state) => state.isDrawerOpen);
  const toggleDrawerOpen = useDrawerStore((state) => state.toggleDrawerOpen);

  return (
    <SwipeableDrawer
      disableBackdropTransition={!iOS}
      disableDiscovery={iOS}
      anchor="left"
      open={isDrawerOpen}
      onClose={toggleDrawerOpen}
      onOpen={toggleDrawerOpen}
      ModalProps={{
        keepMounted: true,
      }}
      sx={{
        display: { xs: "block", sm: "none" },
        "& .MuiDrawer-paper": {
          boxSizing: "border-box",
          width: drawerWidth,
          "&::-webkit-scrollbar": {
            display: "none",
          },
          scrollbarWidth: "none", // Hide the scrollbar for Firefox
          msOverflowStyle: "none",
        },
      }}
    >
      <DrawerHeader />
      <DrawerList />
    </SwipeableDrawer>
  );
}

export default SwipeableMobileDrawer;
