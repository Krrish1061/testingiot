import { Theme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { lazy } from "react";
import SuspenseFallback from "../components/SuspenseFallback";

const LazyDesktopSendLiveData = lazy(
  () => import("../components/sendLiveData/datagrid/DesktopSendLiveData")
);
const LazyMobileSendLiveData = lazy(
  () =>
    import(
      "../components/sendLiveData/mobileManageSendLive.tsx/MobileSendLiveData"
    )
);

function SendLiveData() {
  const smallScreen = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md")
  );

  return (
    <SuspenseFallback>
      {smallScreen ? <LazyMobileSendLiveData /> : <LazyDesktopSendLiveData />}
    </SuspenseFallback>
  );
}

export default SendLiveData;
