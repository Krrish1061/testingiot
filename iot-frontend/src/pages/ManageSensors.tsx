import { Theme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { lazy } from "react";
import SuspenseFallback from "../components/SuspenseFallback";

const LazyDesktopManageSensors = lazy(
  () => import("../components/sensor/datagrid/DesktopManageSensors")
);
const LazyMobileManageSensors = lazy(
  () => import("../components/sensor/mobileManageSensor/MobileManageSensors")
);

function ManageSensors() {
  const smallScreen = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md")
  );
  return (
    <SuspenseFallback>
      {smallScreen ? <LazyMobileManageSensors /> : <LazyDesktopManageSensors />}
    </SuspenseFallback>
  );
}

export default ManageSensors;
