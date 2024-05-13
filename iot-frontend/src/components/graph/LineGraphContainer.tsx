import Box from "@mui/material/Box";
import { SelectChangeEvent } from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import useGetData from "../../hooks/graph/useGetData";
import useGetDeviceSensorList from "../../hooks/graph/useGetDeviceSensorList";
import useRequestData from "../../hooks/graph/useRequestData";
import DaysSelectors from "./DaysSelectors";
import DeviceSensorSelector from "./DeviceSensorSelector";
import LineGraph from "./LineGraph";
import minMax from "dayjs/plugin/minMax";
import ISensorData from "../../entities/webSocket/SensorData";
dayjs.extend(minMax);
import { Chart as ChartJS } from "chart.js";

interface Props {
  username?: string;
  companySlug?: string;
}

function LineGraphContainer({ username, companySlug }: Props) {
  const chartRef = useRef<ChartJS<"line", ISensorData[]> | null>(null);
  const [selectedDays, setSelectedDays] = useState<1 | 7 | 15>(1);
  const [device, setDevice] = useState<number | null>(null);
  const [sensor, setSensor] = useState<string>("");
  const [startDate, setStartDate] = useState(dayjs());
  const endDate = dayjs().endOf("day");

  useEffect(() => {
    setDevice(null);
    setSensor("");
    setSelectedDays(1);
    setStartDate(dayjs());
  }, [username, companySlug]);

  const { iotDevices, deviceSensorList, sensorSymbol, isSensorValueBoolean } =
    useGetDeviceSensorList({
      username: username,
      companySlug: companySlug,
      device: device,
      sensor: sensor,
    });

  useRequestData({
    sensor: sensor,
    deviceId: device,
    startDate: startDate,
    endDate: endDate,
    selectedDays: selectedDays,
  });

  const { graphData, isLoading } = useGetData({
    sensor: sensor,
    deviceId: device,
  });

  useEffect(() => {
    if (iotDevices.length > 0) {
      const iotDevice = iotDevices[0];
      setDevice(iotDevice.id);
      if (iotDevice.sensor_name_list.length > 0)
        setSensor(iotDevice.sensor_name_list[0]);
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
    }
    setDevice(value);
  };

  const handleSensorChange = (event: SelectChangeEvent) =>
    setSensor(event.target.value);

  const handleDownloadClick = () => {
    const chart = chartRef.current;
    if (chart) {
      console.log("click");
      const link = document.createElement("a");
      link.download =
        sensor.charAt(0).toUpperCase() +
        sensor.substring(1) +
        " " +
        "Sensor Chart.jpeg";
      link.href = chart.toBase64Image("image/jpeg", 1);
      link.click();
    }
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
        sensorList={deviceSensorList}
        isLoading={isLoading}
        handleDeviceChange={handleDeviceChange}
        handleSensorChange={handleSensorChange}
        handleDownloadClick={handleDownloadClick}
      />
      <LineGraph
        chartRef={chartRef}
        sensor={sensor}
        sensorSymbol={sensorSymbol}
        isSensorValueBoolean={isSensorValueBoolean}
        graphData={graphData}
        uptoDays={selectedDays}
        startDate={startDate.format("YYYY-MM-DD")}
        endDate={
          selectedDays === 1
            ? (dayjs.min(dayjs().add(1, "hour"), endDate) || endDate).format(
                "YYYY-MM-DD HH:mm:ss"
              )
            : endDate.add(1, "day").startOf("day").format("YYYY-MM-DD HH:mm:ss")
        }
      />
    </Box>
  );
}

export default LineGraphContainer;
