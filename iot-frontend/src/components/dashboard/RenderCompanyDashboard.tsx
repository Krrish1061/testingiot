import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { ReactNode, SyntheticEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import useGetAllCompany from "../../hooks/company/useGetAllCompany";
import useGetAllIotDevice from "../../hooks/iotDevice/useGetAllIotDevice";
import useWebSocketStore from "../../store/webSocket/webSocketStore";
import CustomNoRowsOverlay from "../datagrid/CustomNoRowsOverlay";
import LineGraphContainer from "../graph/LineGraphContainer";
import IotDeviceApiSetting from "../iotDevice/IotDeviceApiSetting";
import IotDeviceSensor from "../iotDevice/IotDeviceSensor";
import LiveDataCardContainer from "../liveData/LiveDataCardContainer";

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
  const { companySlug } = useParams();
  const { data: iotDeviceList } = useGetAllIotDevice();
  const sendWebSocketMessage = useWebSocketStore(
    (state) => state.sendWebSocketMessage
  );
  const websocket = useWebSocketStore((state) => state.websocket);
  const subscribedGroup = useWebSocketStore((state) => state.subscribedGroup);
  const setSubscribedGroup = useWebSocketStore(
    (state) => state.setSubscribedGroup
  );

  const setliveDataToNull = useWebSocketStore(
    (state) => state.setliveDataToNull
  );
  const { data } = useGetAllCompany();
  const currentCompany = useMemo(
    () => data?.find((value) => value.slug === companySlug),
    [data, companySlug]
  );

  const [value, setValue] = useState(0);

  const handleChange = (_event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  useEffect(() => {
    setValue(0);
    if (websocket && subscribedGroup !== companySlug) {
      setliveDataToNull();
      sendWebSocketMessage({
        type: "group_subscribe",
        company_slug: companySlug,
        group_type: "company",
      });
      setSubscribedGroup(companySlug || null);
    }
  }, [
    websocket,
    companySlug,
    subscribedGroup,
    setliveDataToNull,
    sendWebSocketMessage,
    setSubscribedGroup,
  ]);

  const companyIotDeviceList = useMemo(
    () => iotDeviceList?.filter((device) => device.company === companySlug),
    [iotDeviceList, companySlug]
  );

  if (companyIotDeviceList?.length === 0)
    return <CustomNoRowsOverlay text="No Iot Device Asscociated" />;

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
        <LineGraphContainer companySlug={companySlug} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <IotDeviceSensor companySlug={companySlug} />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <IotDeviceApiSetting companySlug={companySlug} />
      </TabPanel>
    </>
  );
}

export default RenderCompanyDashboard;
