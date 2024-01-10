import Box from "@mui/material/Box";
import NavBar from "../navbar/NavBar";
import { Outlet } from "react-router-dom";
import { SideBarHeader } from "../drawer/DrawerHeader";
import useConnectWebSocket from "../../hooks/useConnectWebSocket";

function ViewerDashboard() {
  useConnectWebSocket();

  return (
    <Box sx={{ display: "flex" }}>
      <NavBar />
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

export default ViewerDashboard;
