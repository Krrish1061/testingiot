import Box from "@mui/material/Box";
import NavBar from "../navbar/NavBar";
import { SideBarHeader } from "../drawer/DrawerHeader";
import useConnectWebSocket from "../../hooks/useConnectWebSocket";
import useTheme from "@mui/material/styles/useTheme";
import useMediaQuery from "@mui/material/useMediaQuery";
import MobileDrawer from "../drawer/MobileDrawer";
import { Outlet } from "react-router-dom";
import DesktopDrawer from "../drawer/DesktopDrawer";

function AdminDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"), { noSsr: true });
  useConnectWebSocket();
  return (
    <Box sx={{ display: "flex", width: 1 }}>
      <NavBar />
      {isMobile ? <MobileDrawer /> : <DesktopDrawer />}
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 2, overflow: "auto", height: 1, width: 1 }}
      >
        <SideBarHeader />
        <Outlet />
      </Box>
    </Box>
  );
}

export default AdminDashboard;
