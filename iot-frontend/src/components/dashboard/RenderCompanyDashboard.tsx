import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import {
  ReactNode,
  SyntheticEvent,
  lazy,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import useGetAllCompany from "../../hooks/company/useGetAllCompany";
import useGetAllIotDevice from "../../hooks/iotDevice/useGetAllIotDevice";
import useAuthStore from "../../store/authStore";
import useWebSocketStore from "../../store/webSocket/webSocketStore";
import SuspenseFallback from "../SuspenseFallback";
import CustomNoRowsOverlay from "../datagrid/CustomNoRowsOverlay";
import LineGraphContainer from "../graph/LineGraphContainer";
import LiveDataCardContainer from "../liveData/LiveDataCardContainer";

interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}

const LazyIotDeviceSensor = lazy(() => import("../iotDevice/IotDeviceSensor"));
const LazyIotDeviceApiSetting = lazy(
  () => import("../iotDevice/IotDeviceApiSetting")
);

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`company-overview-${index}`}
      aria-labelledby={`company-overview-${index}`}
      {...other}
    >
      {value === index && children}
    </Box>
  );
}

function a11yProps(index: number) {
  return {
    id: `company-overview-${index}`,
    "aria-controls": `company-overview-${index}`,
  };
}

function RenderCompanyDashboard() {
  const [value, setValue] = useState(0);
  const { companySlug } = useParams();
  const { data: iotDeviceList } = useGetAllIotDevice();
  const { data: companyList } = useGetAllCompany();

  const sendWebSocketMessage = useWebSocketStore(
    (state) => state.sendWebSocketMessage
  );
  const connectionState = useWebSocketStore((state) => state.connectionState);
  const websocket = useWebSocketStore((state) => state.websocket);
  const subscribedGroup = useWebSocketStore((state) => state.subscribedGroup);
  const setSubscribedGroup = useWebSocketStore(
    (state) => state.setSubscribedGroup
  );
  const liveData = useWebSocketStore((state) => state.liveData);
  const setliveDataToNull = useWebSocketStore(
    (state) => state.setliveDataToNull
  );

  const isUserDealer = useAuthStore((state) => state.isUserDealer);

  const currentCompany = useMemo(
    () => companyList?.find((value) => value.slug === companySlug),
    [companyList, companySlug]
  );

  const companyIotDeviceList = useMemo(
    () => iotDeviceList?.filter((device) => device.company === companySlug),
    [iotDeviceList, companySlug]
  );

  useEffect(() => {
    if (websocket && subscribedGroup !== companySlug) {
      sendWebSocketMessage({
        type: "group_subscribe",
        company_slug: companySlug,
        group_type: "company",
      });
      setSubscribedGroup(companySlug || null);
    }
    if (!websocket && connectionState === "disconnected") {
      setSubscribedGroup(null);
    }
  }, [
    websocket,
    companySlug,
    subscribedGroup,
    connectionState,
    sendWebSocketMessage,
    setSubscribedGroup,
  ]);

  useEffect(() => {
    setValue(0);
    setliveDataToNull();
  }, [companySlug, setliveDataToNull]);

  const handleChange = (_event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  if (companyIotDeviceList?.length === 0)
    return <CustomNoRowsOverlay text="No Iot Device Asscociated" />;

  if (isUserDealer) {
    return (
      <>
        <LiveDataCardContainer />
        {liveData && <LineGraphContainer companySlug={companySlug} />}
      </>
    );
  }

  return (
    <>
      <Tabs
        value={value}
        onChange={handleChange}
        textColor="secondary"
        indicatorColor="secondary"
        aria-label="company overview"
        variant="scrollable"
        scrollButtons
        allowScrollButtonsMobile
        selectionFollowsFocus
      >
        <Tab label={`${currentCompany?.name} OVERVIEW`} {...a11yProps(0)} />
        <Tab label="IOT DEVICES" {...a11yProps(1)} />
        <Tab label="API Setting" {...a11yProps(2)} />
      </Tabs>
      <TabPanel value={value} index={0}>
        <LiveDataCardContainer />
        {liveData && <LineGraphContainer companySlug={companySlug} />}
      </TabPanel>
      <TabPanel value={value} index={1}>
        <SuspenseFallback
          children={<LazyIotDeviceSensor companySlug={companySlug} />}
        />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <SuspenseFallback
          children={<LazyIotDeviceApiSetting companySlug={companySlug} />}
        />
      </TabPanel>
    </>
  );
}

export default RenderCompanyDashboard;
