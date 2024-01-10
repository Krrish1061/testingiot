import MobileManageCompanies from "../components/company/mobileManagecompany/MobileManageCompany";
import { Theme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import DesktopManageCompanies from "../components/company/datagrid/DesktopManageCompanies";

function ManageCompany() {
  const smallScreen = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md")
  );
  if (smallScreen) return <MobileManageCompanies />;
  else return <DesktopManageCompanies />;
}

export default ManageCompany;
