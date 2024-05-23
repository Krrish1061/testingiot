import Box from "@mui/material/Box";
import { SelectChangeEvent } from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import { Chart as ChartJS } from "chart.js";
import dayjs from "dayjs";
import minMax from "dayjs/plugin/minMax";
import { useEffect, useRef, useState } from "react";
import useGetDeviceSensorList from "../../hooks/graph/useGetDeviceSensorList";
import useRequestData from "../../hooks/graph/useRequestData";
import useWebSocketStore from "../../store/webSocket/webSocketStore";
import CompareSensorSelector from "./CompareSensorSelector";
import DaysSelectors from "./DaysSelectors";
import DeviceSensorSelector from "./DeviceSensorSelector";
import LineGraph from "./LineGraph";
dayjs.extend(minMax);

interface Props {
  username?: string;
  companySlug?: string;
}

function LineGraphContainer({ username, companySlug }: Props) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const chartRef = useRef<ChartJS<"line"> | null>(null);
  const [compareSensorSelectedIndex, setCompareSensorSelectedIndex] =
    useState(-1);
  const [selectedDays, setSelectedDays] = useState<1 | 7 | 15>(1);
  const [device, setDevice] = useState<number | null>(null);
  const [sensor, setSensor] = useState<string>("");
  const [compareTo, setCompareTo] = useState<{
    deviceId: number;
    sensor: string;
  } | null>(null);
  // graphdata loading state -- fetching done via websocket
  const isLoading = useWebSocketStore((state) => state.isLoading);
  const [startDate, setStartDate] = useState(dayjs());
  const [endDate] = useState(() => dayjs().endOf("day"));

  const { iotDevices, deviceSensorList } = useGetDeviceSensorList({
    username: username,
    companySlug: companySlug,
    device: device,
  });

  useRequestData({
    sensor: sensor,
    deviceId: device,
    startDate: startDate,
    endDate: endDate,
    selectedDays: selectedDays,
    compareTo: compareTo,
  });

  useEffect(() => {
    setDevice(null);
    setSensor("");
    setCompareTo(null);
    setSelectedDays(1);
    setStartDate(dayjs());
  }, [username, companySlug]);

  useEffect(() => {
    if (iotDevices.length > 0) {
      const iotDevice = iotDevices[0];
      setDevice(iotDevice.id);
      if (iotDevice.sensor_name_list.length > 0) {
        setSensor(iotDevice.sensor_name_list[0]);
      }
    }
  }, [iotDevices]);

  const handleButtonClick = (index: 1 | 7 | 15) => {
    setSelectedDays(index);
    switch (index) {
      case 1:
        setStartDate(dayjs());
        break;
      case 7:
        setStartDate(dayjs().subtract(6, "day"));
        break;
      case 15:
        setStartDate(dayjs().subtract(14, "day"));
        break;
    }
  };

  const handleDeviceChange = (event: SelectChangeEvent) => {
    const value =
      event.target.value === "" ? null : parseInt(event.target.value);
    if (value !== null && value !== device) {
      setSensor("");
      setCompareTo(null);
    }
    setDevice(value);
  };

  const handleSensorChange = (event: SelectChangeEvent) => {
    const sensorName = event.target.value;
    setSensor(sensorName);
    if (!sensorName) setCompareTo(null);
  };

  const handleDownloadClick = () => {
    const chart = chartRef.current;
    if (chart) {
      const link = document.createElement("a");
      const sensorName = sensor.charAt(0).toUpperCase() + sensor.substring(1);
      const compareSensorName =
        compareTo &&
        compareTo.sensor.charAt(0).toUpperCase() +
          compareTo.sensor.substring(1);
      const downloadName = compareSensorName
        ? sensorName + " vs " + compareSensorName
        : sensorName;
      link.download = downloadName + " " + "Sensor Chart.jpeg";
      link.href = chart.toBase64Image("image/jpeg", 1);
      link.click();
    }
  };

  const handleCompareClick = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleCompareClearClick = () => {
    setCompareTo(null);
    setCompareSensorSelectedIndex(-1);
  };

  if (
    iotDevices.length === 0 ||
    (iotDevices.length === 1 && deviceSensorList.length === 0) ||
    device === null
  )
    return;

  return (
    <Box
      width={1}
      marginTop={2}
      padding={2}
      sx={{
        borderStyle: "solid",
        borderWidth: "1px",
        borderColor: "primary.main",
      }}
    >
      <Typography gutterBottom textAlign="center" component="h2" variant="h4">
        TREND
      </Typography>
      <DaysSelectors
        selectedDays={selectedDays}
        onClick={handleButtonClick}
        isLoading={isLoading}
      />
      <DeviceSensorSelector
        device={device}
        iotDevices={iotDevices}
        sensor={sensor}
        compareTo={compareTo}
        sensorList={deviceSensorList}
        isLoading={isLoading}
        anchorRef={anchorRef}
        handleDeviceChange={handleDeviceChange}
        handleSensorChange={handleSensorChange}
        handleDownloadClick={handleDownloadClick}
        handleCompareClick={handleCompareClick}
        handleCompareClearClick={handleCompareClearClick}
      />
      <LineGraph
        chartRef={chartRef}
        sensor={sensor}
        device={device}
        startDate={startDate}
        compareTo={compareTo}
        uptoDays={selectedDays}
        endDate={endDate}
      />
      <CompareSensorSelector
        open={open}
        anchorRef={anchorRef}
        iotDevices={iotDevices}
        deviceSensorList={deviceSensorList}
        selectedSensor={sensor}
        selectedDevice={device}
        selectedIndex={compareSensorSelectedIndex}
        setOpen={setOpen}
        setCompareTo={setCompareTo}
        setSelectedIndex={setCompareSensorSelectedIndex}
      />
    </Box>
  );
}

export default LineGraphContainer;
