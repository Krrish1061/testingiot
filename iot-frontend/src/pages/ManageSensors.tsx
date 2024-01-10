import DesktopManageSensors from "../components/sensor/datagrid/DesktopManageSensors";
import { Theme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import MobileManageSensors from "../components/sensor/mobileManageSensor/MobileManageSensors";

function ManageSensors() {
  const smallScreen = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md")
  );
  if (smallScreen) return <MobileManageSensors />;
  else return <DesktopManageSensors />;
}

export default ManageSensors;
