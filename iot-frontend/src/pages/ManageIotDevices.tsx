import { Theme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import DesktopManageIotDevice from "../components/iotDevice/datagrid/DesktopManageIotDevice";
import MobileManageIotDevice from "../components/iotDevice/mobileManageIotDevice/MobileManageIotDevice";

function ManageIotDevices() {
  const smallScreen = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md")
  );
  if (smallScreen) return <MobileManageIotDevice />;
  else return <DesktopManageIotDevice />;
}

export default ManageIotDevices;
