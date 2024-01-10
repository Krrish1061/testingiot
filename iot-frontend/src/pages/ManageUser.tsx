import { Theme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import DesktopManageUser from "../components/user/datagrid/DesktopManageUser";
import MobileManageUsers from "../components/user/mobileUserTable/MobileManageUsers";

// add api key request button on user column.
function ManageUser() {
  // for tablet and mobile devices
  const smallScreen = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md")
  );

  if (smallScreen) return <MobileManageUsers />;
  else return <DesktopManageUser />;
}

export default ManageUser;
