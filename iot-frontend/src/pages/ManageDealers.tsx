import { Theme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import DesktopManageDealer from "../components/dealer/datagrid/DesktopManageDealer";
import MobileManageDealer from "../components/dealer/mobileManageDealer/MobileManageDealer";

function ManageDealers() {
  const smallScreen = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md")
  );
  if (smallScreen) return <MobileManageDealer />;
  else return <DesktopManageDealer />;
}

export default ManageDealers;
