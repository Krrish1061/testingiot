import { Theme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import DesktopSendLiveData from "../components/sendLiveData/datagrid/DesktopSendLiveData";
import MobileSendLiveData from "../components/sendLiveData/mobileManageSendLive.tsx/MobileSendLiveData";

function SendLiveData() {
  const smallScreen = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md")
  );

  if (smallScreen) return <MobileSendLiveData />;
  else return <DesktopSendLiveData />;
}

export default SendLiveData;
