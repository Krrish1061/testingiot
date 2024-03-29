import { ReactNode, SyntheticEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import useWebSocketStore from "../../store/webSocketStore";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import LiveDataCardContainer from "../liveData/LiveDataCardContainer";
import useGetAllUser from "../../hooks/users/useGetAllUser";
import Box from "@mui/material/Box";
import IotDeviceSensor from "../iotDevice/IotDeviceSensor";
import IotDeviceApiSetting from "../iotDevice/IotDeviceApiSetting";

interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}

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
  const { username } = useParams();
  const sendWebSocketMessage = useWebSocketStore(
    (state) => state.sendWebSocketMessage
  );
  const websocket = useWebSocketStore((state) => state.websocket);

  const setliveDataToNull = useWebSocketStore(
    (state) => state.setliveDataToNull
  );

  const { data } = useGetAllUser();
  const currentAdminUser = useMemo(
    () => data?.find((value) => value.username === username),
    [data, username]
  );
  const [value, setValue] = useState(0);

  const handleChange = (_event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  useEffect(() => {
    setValue(0);
    setliveDataToNull();
    sendWebSocketMessage({
      type: "group_subscribe",
      username: username,
      group_type: "user",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  useEffect(() => {
    sendWebSocketMessage({
      type: "group_subscribe",
      username: username,
      group_type: "user",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [websocket]);

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
      </TabPanel>
      <TabPanel value={value} index={1}>
        <IotDeviceSensor username={username} />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <IotDeviceApiSetting username={username} />
      </TabPanel>
    </>
  );
}
export default RenderUserDashboard;
