import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import { useTheme } from "@mui/material/styles";
import {
  CategoryScale,
  ChartData,
  Chart as ChartJS,
  Decimation,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  TimeScale,
  TimeSeriesScale,
  Title,
} from "chart.js";
import "chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm";
import zoomPlugin from "chartjs-plugin-zoom";
import dayjs, { Dayjs } from "dayjs";
import { MutableRefObject, useMemo } from "react";
import { Line } from "react-chartjs-2";
import useGetData from "../../hooks/graph/useGetData";
import useDrawerStore from "../../store/drawerStore";
import createChartOptions from "./ChartConfig";
import { backgroundColorPlugin, chartBorderLinePlugin } from "./ChartPlugins";
import createZoomOptions from "./ZoomPluginConfig";

ChartJS.register(
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeSeriesScale,
  CategoryScale,
  Title,
  Legend,
  Decimation,
  zoomPlugin
);

interface Props {
  chartRef: MutableRefObject<ChartJS<"line", unknown> | null>;
  sensor: string;
  startDate: Dayjs;
  endDate: Dayjs;
  device: number;
  uptoDays: 1 | 7 | 15;
  compareTo: {
    deviceId: number;
    sensor: string;
  } | null;
}

function LineGraph({
  chartRef,
  sensor,
  startDate,
  endDate,
  device,
  compareTo,
  uptoDays,
}: Props) {
  const isMobile = useDrawerStore((state) => state.isMobile);
  const theme = useTheme();

  const {
    graphData,
    compareData,
    sensorSymbol,
    isSensorValueBoolean,
    compareSensorSymbol,
    isCompareSensorValueBoolean,
  } = useGetData({
    sensor: sensor,
    deviceId: device,
    compareTo: compareTo,
  });

  const isCompareEnabled = !!compareTo;

  const chartEndDate = useMemo(
    () =>
      uptoDays === 1
        ? (dayjs.min(dayjs().add(2, "hour"), endDate) || endDate).startOf(
            "hour"
          )
        : endDate.add(1, "day").startOf("day"),
    [endDate, uptoDays]
  );

  const zoomOptions = useMemo(
    () => createZoomOptions(startDate, chartEndDate),
    [chartEndDate, startDate]
  );

  const chartOptions = useMemo(
    () =>
      createChartOptions(
        theme,
        isMobile,
        isSensorValueBoolean,
        isCompareEnabled,
        sensor,
        startDate,
        chartEndDate,
        sensorSymbol,
        compareSensorSymbol,
        isCompareSensorValueBoolean,
        zoomOptions
      ),
    [
      theme,
      isMobile,
      isSensorValueBoolean,
      isCompareEnabled,
      sensor,
      startDate,
      chartEndDate,
      sensorSymbol,
      compareSensorSymbol,
      isCompareSensorValueBoolean,
      zoomOptions,
    ]
  );

  if (graphData === null)
    return (
      <Skeleton variant="rounded" animation="wave" width="100%" height={200} />
    );

  const chartData: ChartData<"line"> = {
    datasets: [
      {
        data: sensor ? graphData : [],
        fill: false,
        label: sensor.charAt(0).toUpperCase() + sensor.substring(1),
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.main,
        borderWidth: isSensorValueBoolean ? 2 : 1,
        normalized: true,
        pointStyle: graphData.length === 1 ? "circle" : false,
        pointRadius: graphData.length === 1 ? 3 : 0,
        stepped: isSensorValueBoolean,
        yAxisID: "y",
      },
      {
        data: compareTo && compareData ? compareData : [],
        fill: false,
        label: compareTo
          ? compareTo.sensor.charAt(0).toUpperCase() +
            compareTo.sensor.substring(1)
          : "",
        borderColor: theme.palette.success.main,
        backgroundColor: theme.palette.success.main,
        borderWidth: isCompareSensorValueBoolean ? 2 : 1,
        normalized: true,
        pointStyle: compareData?.length === 1 ? "circle" : false,
        pointRadius: compareData?.length === 1 ? 3 : 0,
        stepped: isCompareSensorValueBoolean,
        yAxisID: "y1",
      },
    ],
  };

  return (
    <Box height={{ xs: 250, sm: 300, md: 450 }}>
      <Line
        ref={chartRef}
        options={chartOptions}
        data={chartData}
        plugins={[backgroundColorPlugin, chartBorderLinePlugin]}
      />
    </Box>
  );
}

export default LineGraph;
