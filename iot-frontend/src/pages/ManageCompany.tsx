import { Theme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { lazy } from "react";
import SuspenseFallback from "../components/SuspenseFallback";

const LazyDesktopManageCompanies = lazy(
  () => import("../components/company/datagrid/DesktopManageCompanies")
);
const LazyMobileManageCompanies = lazy(
  () => import("../components/company/mobileManagecompany/MobileManageCompany")
);

function ManageCompany() {
  const smallScreen = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md")
  );
  return (
    <SuspenseFallback>
      {smallScreen ? (
        <LazyMobileManageCompanies />
      ) : (
        <LazyDesktopManageCompanies />
      )}
    </SuspenseFallback>
  );
}

export default ManageCompany;
