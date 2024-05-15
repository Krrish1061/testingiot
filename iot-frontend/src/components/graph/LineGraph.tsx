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
  Plugin,
  Decimation,
} from "chart.js";
import "chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm";
import { Line } from "react-chartjs-2";
import ISensorData from "../../entities/webSocket/SensorData";
import useDrawerStore from "../../store/drawerStore";
import { MutableRefObject, useMemo } from "react";
import dayjs from "dayjs";

ChartJS.register(
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeSeriesScale,
  CategoryScale,
  Title,
  Decimation
  // Legend
);

interface Props {
  chartRef: MutableRefObject<ChartJS<"line", unknown, unknown> | null>;
  graphData: ISensorData[] | null;
  sensor: string;
  sensorSymbol: string | null;
  isSensorValueBoolean: boolean;
  startDate: string;
  endDate: string;
  uptoDays: 1 | 7 | 15;
}

function LineGraph({
  chartRef,
  sensor,
  sensorSymbol,
  isSensorValueBoolean,
  startDate,
  endDate,
  uptoDays,
  graphData,
}: Props) {
  const isMobile = useDrawerStore((state) => state.isMobile);
  const theme = useTheme();

  const chartDataArr = useMemo(
    () =>
      sensor
        ? graphData?.map((data) => ({
            x: dayjs(data.date_time).valueOf(),
            y: data.value,
          })) || []
        : [],

    [graphData, sensor]
  );

  if (graphData === null)
    return (
      <Skeleton variant="rounded" animation="wave" width="100%" height={200} />
    );

  const titlefontSize = isMobile ? 12 : 15;

  const plugin: Plugin<"line"> = {
    id: "bgColor",
    beforeDraw: (chart, _args, options) => {
      const { ctx, width, height } = chart;
      ctx.save();
      ctx.globalCompositeOperation = "destination-over";
      ctx.fillStyle = options.backgroundColor;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    },
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    spanGaps: isSensorValueBoolean ? true : 1000 * 60 * 60 * 24 * 1, // 1 days,
    maintainAspectRatio: false,
    resizeDelay: 250,
    animation: false,
    parsing: false,

    datasets: {
      line: {
        pointStyle: graphData.length === 1 ? "circle" : false,
        pointRadius: graphData.length === 1 ? 3 : 0,
      },
    },

    plugins: {
      decimation: {
        enabled: true,
        algorithm: "lttb",
        samples: 1000,
        threshold: 1000,
      },
      bgColor: {
        backgroundColor: theme.palette.background.paper,
      },
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
        min: isSensorValueBoolean ? 0 : undefined,
        max: isSensorValueBoolean ? 1 : undefined,
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
  };

  const chartData = {
    datasets: [
      {
        data: chartDataArr,
        fill: false,
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.main,
        borderWidth: isSensorValueBoolean ? 2 : 1,
        normalized: true,
        stepped: isSensorValueBoolean,
      },
    ],
  };

  return (
    <Box height={{ xs: 250, sm: 300, md: 450 }}>
      <Line
        ref={chartRef}
        options={options}
        data={chartData}
        plugins={[plugin]}
      />
    </Box>
  );
}

export default LineGraph;
