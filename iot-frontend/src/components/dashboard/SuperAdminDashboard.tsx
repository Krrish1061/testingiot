import Box from "@mui/material/Box";
import NavBar from "../navbar/NavBar";
import DesktopDrawer from "../drawer/DesktopDrawer";
import { SideBarHeader } from "../drawer/DrawerHeader";
import useTheme from "@mui/material/styles/useTheme";
import useMediaQuery from "@mui/material/useMediaQuery";
import MobileDrawer from "../drawer/MobileDrawer";
import { Outlet } from "react-router-dom";

function SuperAdminDashboard() {
  const theme = useTheme();
  // use this hook in higher order component to reset the drawer
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"), { noSsr: true });
  return (
    <Box sx={{ display: "flex" }}>
      <NavBar />
      {isMobile ? <MobileDrawer /> : <DesktopDrawer />}
      <Box component="main" sx={{ flexGrow: 1, p: 2, overflow: "auto" }}>
        <SideBarHeader />
        <Outlet />
      </Box>
    </Box>
  );
}

export default SuperAdminDashboard;
