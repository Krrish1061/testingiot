import Box from "@mui/material/Box";
import Test from "../Test";
import NavBar from "../navbar/NavBar";
import { SideBarHeader } from "../drawer/DrawerHeader";

function AdminDashboard() {
  return (
    <Box sx={{ display: "flex" }}>
      <NavBar />
      <Box component="main" sx={{ flexGrow: 1, p: 2, overflow: "hidden" }}>
        <SideBarHeader />
        <Box>
          <Test />
        </Box>
      </Box>
    </Box>
  );
}

export default AdminDashboard;
