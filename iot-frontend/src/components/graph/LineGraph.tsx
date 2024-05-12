import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import { useTheme } from "@mui/material/styles";
import {
  CategoryScale,
  Chart as ChartJS,
  ChartOptions,
  LineElement,
  LinearScale,
  PointElement,
  TimeScale,
  TimeSeriesScale,
  Title,
} from "chart.js";
import "chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm";
import { useRef } from "react";
import { Line } from "react-chartjs-2";
import ISensorData from "../../entities/webSocket/SensorData";
import useDrawerStore from "../../store/drawerStore";

ChartJS.register(
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeSeriesScale,
  CategoryScale,
  Title
  // Legend
);

interface Props {
  graphData: ISensorData[] | null;
  sensor: string;
  sensorSymbol: string | null;
  isSensorValueBoolean: boolean;
  startDate: string;
  endDate: string;
  uptoDays: 1 | 7 | 15;
}

function LineGraph({
  sensor,
  sensorSymbol,
  isSensorValueBoolean,
  startDate,
  endDate,
  uptoDays,
  graphData,
}: Props) {
  const chartRef = useRef<ChartJS<"line", ISensorData[]> | null>(null);
  const isMobile = useDrawerStore((state) => state.isMobile);
  const theme = useTheme();

  if (graphData === null)
    return (
      <Skeleton variant="rounded" animation="wave" width="100%" height={200} />
    );

  const titlefontSize = isMobile ? 12 : 15;

  const options: ChartOptions<"line"> = {
    responsive: true,
    spanGaps: 1000 * 60 * 60 * 24 * 1, // 1 days,
    maintainAspectRatio: false,
    resizeDelay: 250,
    animation: isMobile ? false : undefined,
    datasets: {
      line: {
        pointStyle: graphData.length === 1 ? "circle" : false,
        pointRadius: graphData.length === 1 ? 3 : 0,
      },
    },

    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: sensor
          ? sensor.charAt(0).toUpperCase() + sensor.substring(1) + " Sensor"
          : undefined,

        color: theme.palette.primary.main,
        font: {
          size: titlefontSize,
          weight: "bold",
        },
      },
    },
    scales: {
      x: {
        type: "time",
        title: {
          display: true,
          text: "Date",
          color: theme.palette.primary.main,
          font: {
            size: titlefontSize,
            weight: "bold",
          },
        },
        time: {
          unit: uptoDays === 1 ? "minute" : uptoDays === 7 ? "hour" : "day",
        },

        ticks: {
          maxRotation: 0,
          autoSkip: true,
          major: {
            enabled: true,
          },
          font: function (context) {
            if (context.tick && context.tick.major) return { weight: "bold" };
          },
        },

        max: endDate,
        min: startDate,
      },
      y: {
        // min: 0,
        // max: 90,
        // beginAtZero: true,
        title: {
          display: true,
          text: "Value" + (sensorSymbol ? `(${sensorSymbol})` : ""),
          color: theme.palette.primary.main,
          font: {
            size: titlefontSize,
            weight: "bold",
          },
          padding: 0,
        },
        ticks: {
          precision: 2,
          stepSize: isSensorValueBoolean ? 1 : undefined,
          callback: isSensorValueBoolean
            ? function (value) {
                return value === 1 ? "ON" : "OFF";
              }
            : undefined,
        },
      },
    },
    parsing: {
      xAxisKey: "date_time",
      yAxisKey: "value",
    },
  };

  const chartData = {
    datasets: [
      {
        data: sensor ? graphData : [],
        fill: false,
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.main,
        borderWidth: 1,
        normalized: true,
        stepped: isSensorValueBoolean,
      },
    ],
  };

  return (
    <Box height={{ xs: 250, sm: 300, md: 450 }}>
      <Line ref={chartRef} options={options} data={chartData} />
    </Box>
  );
}

export default LineGraph;
