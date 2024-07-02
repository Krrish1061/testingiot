import { Theme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { lazy } from "react";
import SuspenseFallback from "../components/SuspenseFallback";

const LazyDesktopManageUser = lazy(
  () => import("../components/user/datagrid/DesktopManageUser")
);
const LazyMobileManageUsers = lazy(
  () => import("../components/user/mobileUserTable/MobileManageUsers")
);

function ManageUser() {
  // for tablet and mobile devices
  const smallScreen = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md")
  );

  return (
    <SuspenseFallback>
      {smallScreen ? <LazyMobileManageUsers /> : <LazyDesktopManageUser />}
    </SuspenseFallback>
  );
}

export default ManageUser;
