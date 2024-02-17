// import AdminDashboard from "./AdminDashboard";
// import SuperAdminDashboard from "./SuperAdminDashboard";
import UserGroups from "../../constants/userGroups";
import useAuthStore from "../../store/authStore";
import { useEffect } from "react";
import useWebSocketStore from "../../store/webSocketStore";
// import ViewerDashboard from "./ViewerDashboard";
// import ModeratorDashboard from "./ModeratorDashboard";
import useTheme from "@mui/material/styles/useTheme";
import useMediaQuery from "@mui/material/useMediaQuery";
import { SideBarHeader } from "../drawer/DrawerHeader";
import Box from "@mui/material/Box";
import NavBar from "../navbar/NavBar";
import DesktopDrawer from "../drawer/DesktopDrawer";
import { Outlet } from "react-router-dom";
import useConnectWebSocket from "../../hooks/webSocket/useConnectWebSocket";
import useDrawerStore from "../../store/drawerStore";
import SwipeableMobileDrawer from "../drawer/MobileDrawer";

function Dashboard() {
  const theme = useTheme();
  const user = useAuthStore((state) => state.user);
  const setDrawerOpen = useDrawerStore((state) => state.setDrawerOpen);
  const setIsMobile = useDrawerStore((state) => state.setIsMobile);

  const closeWebSocket = useWebSocketStore((state) => state.closeWebSocket);
  // connect to the websocket
  useConnectWebSocket();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"), { noSsr: true });
  const isSuperAdminUser =
    user && user.groups.includes(UserGroups.superAdminGroup);
  const isAdminUser = user && user.groups.includes(UserGroups.adminGroup);
  const isAdminOrSuperAdmin = isSuperAdminUser || isAdminUser;

  useEffect(() => {
    if (!isMobile) {
      setDrawerOpen(true);
    }
    setIsMobile(isMobile);
    return () => {
      // Close WebSocket when component unmounts
      closeWebSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

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
    </Box>
  );
}

export default Dashboard;
