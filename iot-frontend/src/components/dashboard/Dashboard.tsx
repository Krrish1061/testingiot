import Box from "@mui/material/Box";
import useTheme from "@mui/material/styles/useTheme";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import useConnectWebSocket from "../../hooks/webSocket/useConnectWebSocket";
import useAuthStore from "../../store/authStore";
import useDrawerStore from "../../store/drawerStore";
import useWebSocketStore from "../../store/webSocket/webSocketStore";
import DesktopDrawer from "../drawer/DesktopDrawer";
import { SideBarHeader } from "../drawer/DrawerHeader";
import SwipeableMobileDrawer from "../drawer/MobileDrawer";
import NavBar from "../navbar/NavBar";
import DialogUserProfileForm from "../user/DialogUserProfileForm";

function Dashboard() {
  const theme = useTheme();
  const user = useAuthStore((state) => state.user);
  const setDrawerOpen = useDrawerStore((state) => state.setDrawerOpen);
  const setIsMobile = useDrawerStore((state) => state.setIsMobile);
  const closeWebSocket = useWebSocketStore((state) => state.closeWebSocket);
  // connect to the websocket
  useConnectWebSocket();
  // opens a dialog if user hasn't setup their name
  const [openNameForm, setOpenNameForm] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"), { noSsr: true });
  const isSuperAdminUser = useAuthStore((state) => state.isUserSuperAdmin);
  const isUserCompanySuperAdmin = useAuthStore(
    (state) => state.isUserCompanySuperAdmin
  );
  const isUserDealer = useAuthStore((state) => state.isUserDealer);
  const isAdminUser = useAuthStore((state) => state.isUserAdmin);
  const isAdminOrSuperAdmin = isSuperAdminUser || isAdminUser;
  const showProfileFormPopup = !isUserCompanySuperAdmin && !isUserDealer;

  useEffect(() => {
    if (!isMobile) {
      setDrawerOpen(true);
    }
    setIsMobile(isMobile);
  }, [isMobile, setDrawerOpen, setIsMobile]);

  useEffect(() => {
    if (
      showProfileFormPopup &&
      user &&
      user.profile &&
      !user.profile.first_name
    ) {
      setOpenNameForm(true);
    }
    return () => {
      // Close WebSocket when component unmounts
      closeWebSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box sx={{ display: "flex", width: 1 }}>
      <NavBar />
      {isAdminOrSuperAdmin &&
        (isMobile ? <SwipeableMobileDrawer /> : <DesktopDrawer />)}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          padding: 2,
          height: 1,
          width: 1,
          overflow: "auto",
        }}
      >
        <SideBarHeader />
        <Outlet />
      </Box>
      <DialogUserProfileForm open={openNameForm} setOpen={setOpenNameForm} />
    </Box>
  );
}

export default Dashboard;
