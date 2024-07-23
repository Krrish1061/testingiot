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
import useGetAllIotDevice from "../../hooks/iotDevice/useGetAllIotDevice";
import useGetAllUser from "../../hooks/users/useGetAllUser";
import useAuthStore from "../../store/authStore";
import useWebSocketStore from "../../store/webSocket/webSocketStore";
import CustomNoRowsOverlay from "../datagrid/CustomNoRowsOverlay";
import LineGraphContainer from "../graph/LineGraphContainer";
import LiveDataCardContainer from "../liveData/LiveDataCardContainer";
import SuspenseFallback from "../SuspenseFallback";

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
      id={`adminUser-overview-${index}`}
      aria-labelledby={`adminUser-overview-${index}`}
      {...other}
    >
      {value === index && children}
    </Box>
  );
}

function a11yProps(index: number) {
  return {
    id: `adminUser-overview-${index}`,
    "aria-controls": `adminUser-overview-${index}`,
  };
}

function RenderUserDashboard() {
  const [value, setValue] = useState(0);
  const { username } = useParams();
  const { data: iotDeviceList } = useGetAllIotDevice();
  const { data: userList } = useGetAllUser();

  const sendWebSocketMessage = useWebSocketStore(
    (state) => state.sendWebSocketMessage
  );
  const websocket = useWebSocketStore((state) => state.websocket);
  const connectionState = useWebSocketStore((state) => state.connectionState);
  const subscribedGroup = useWebSocketStore((state) => state.subscribedGroup);
  const setSubscribedGroup = useWebSocketStore(
    (state) => state.setSubscribedGroup
  );
  const liveData = useWebSocketStore((state) => state.liveData);
  const setliveDataToNull = useWebSocketStore(
    (state) => state.setliveDataToNull
  );

  const isUserDealer = useAuthStore((state) => state.isUserDealer);

  const currentAdminUser = useMemo(
    () => userList?.find((value) => value.username === username),
    [userList, username]
  );

  const userIotDeviceList = useMemo(
    () => iotDeviceList?.filter((device) => device.user === username),
    [iotDeviceList, username]
  );

  useEffect(() => {
    if (websocket && subscribedGroup !== username) {
      sendWebSocketMessage({
        type: "group_subscribe",
        username: username,
        group_type: "user",
      });
      setSubscribedGroup(username || null);
    }
    if (!websocket && connectionState === "disconnected") {
      setSubscribedGroup(null);
    }
  }, [
    websocket,
    username,
    subscribedGroup,
    connectionState,
    sendWebSocketMessage,
    setSubscribedGroup,
  ]);

  useEffect(() => {
    setValue(0);
    setliveDataToNull();
  }, [username, setliveDataToNull]);

  const handleChange = (_event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  if (userIotDeviceList?.length === 0)
    return <CustomNoRowsOverlay text="No Iot Device Asscociated" />;

  if (isUserDealer) {
    return (
      <>
        <LiveDataCardContainer />
        {liveData && <LineGraphContainer username={username} />}
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
        aria-label="adminUser overview"
        variant="scrollable"
        scrollButtons
        allowScrollButtonsMobile
        selectionFollowsFocus
      >
        <Tab
          label={
            currentAdminUser?.profile?.first_name
              ? `${currentAdminUser?.profile?.first_name} ${currentAdminUser?.profile?.last_name} OVERVIEW`
              : `${currentAdminUser?.username} OVERVIEW`
          }
          {...a11yProps(0)}
        />
        <Tab label="IOT DEVICES" {...a11yProps(1)} />
        <Tab label="API Setting" {...a11yProps(2)} />
      </Tabs>
      <TabPanel value={value} index={0}>
        <LiveDataCardContainer />
        {liveData && <LineGraphContainer username={username} />}
      </TabPanel>
      <TabPanel value={value} index={1}>
        <SuspenseFallback
          children={<LazyIotDeviceSensor username={username} />}
        />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <SuspenseFallback
          children={<LazyIotDeviceApiSetting username={username} />}
        />
      </TabPanel>
    </>
  );
}
export default RenderUserDashboard;
