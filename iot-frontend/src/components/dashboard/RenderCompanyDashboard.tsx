import { ReactNode, SyntheticEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import useWebSocketStore from "../../store/webSocketStore";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import useGetAllCompany from "../../hooks/company/useGetAllCompany";
import IotDeviceSensor from "../iotDevice/IotDeviceSensor";
import IotDeviceApiSetting from "../iotDevice/IotDeviceApiSetting";
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
  const sendWebSocketMessage = useWebSocketStore(
    (state) => state.sendWebSocketMessage
  );
  const websocket = useWebSocketStore((state) => state.websocket);

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
    setliveDataToNull();
    if (websocket) {
      sendWebSocketMessage({
        type: "group_subscribe",
        company_slug: companySlug,
        group_type: "company",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companySlug]);

  useEffect(() => {
    if (websocket) {
      sendWebSocketMessage({
        type: "group_subscribe",
        company_slug: companySlug,
        group_type: "company",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [websocket]);

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
