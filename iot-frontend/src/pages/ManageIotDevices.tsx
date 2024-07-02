import { Theme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { lazy } from "react";
import SuspenseFallback from "../components/SuspenseFallback";

const LazyDesktopManageIotDevice = lazy(
  () => import("../components/iotDevice/datagrid/DesktopManageIotDevice")
);
const LazyMobileManageIotDevice = lazy(
  () =>
    import(
      "../components/iotDevice/mobileManageIotDevice/MobileManageIotDevice"
    )
);

function ManageIotDevices() {
  const smallScreen = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md")
  );
  return (
    <SuspenseFallback>
      {smallScreen ? (
        <LazyMobileManageIotDevice />
      ) : (
        <LazyDesktopManageIotDevice />
      )}
    </SuspenseFallback>
  );
}

export default ManageIotDevices;
