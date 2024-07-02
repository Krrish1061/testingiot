import { Theme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { lazy } from "react";
import SuspenseFallback from "../components/SuspenseFallback";

const LazyDesktopManageDealer = lazy(
  () => import("../components/dealer/datagrid/DesktopManageDealer")
);
const LazyMobileManageDealer = lazy(
  () => import("../components/dealer/mobileManageDealer/MobileManageDealer")
);

function ManageDealers() {
  const smallScreen = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md")
  );
  return (
    <SuspenseFallback>
      {smallScreen ? <LazyMobileManageDealer /> : <LazyDesktopManageDealer />}
    </SuspenseFallback>
  );
}

export default ManageDealers;
