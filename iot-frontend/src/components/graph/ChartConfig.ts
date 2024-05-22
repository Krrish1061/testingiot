import { Theme } from "@mui/material/styles";
import { ChartOptions } from "chart.js";
import { ZoomPluginOptions } from "chartjs-plugin-zoom/types/options";
import { Dayjs } from "dayjs";
import { toggleZoom } from "./chartHelpers";

const createChartOptions = (
  theme: Theme,
  isMobile: boolean,
  isSensorValueBoolean: boolean,
  isCompareEnabled: boolean,
  sensor: string,
  startDate: Dayjs,
  endDate: Dayjs,
  sensorSymbol: string | null,
  compareSensorSymbol: string | null,
  isCompareSensorValueBoolean: boolean,
  zoomOptions: ZoomPluginOptions
) => {
  const titlefontSize = isMobile ? 12 : 15;
  const spanGaps = isSensorValueBoolean ? true : 1000 * 60 * 60 * 24 * 1; // 1 days,
  const sensorName =
    sensor && !isCompareEnabled
      ? sensor.charAt(0).toUpperCase() + sensor.substring(1) + " Sensor"
      : undefined;

  const options: ChartOptions<"line"> = {
    responsive: true,
    spanGaps: spanGaps,
    maintainAspectRatio: false,
    resizeDelay: 250,
    animation: false,
    parsing: false,

    plugins: {
      decimation: {
        enabled: true,
        algorithm: "lttb",
        samples: 500,
        threshold: 1000,
      },
      bgColor: {
        backgroundColor: theme.palette.background.paper,
      },
      chartAreaBorder: {
        borderColor: theme.palette.primary.main,
      },

      legend: {
        display: isCompareEnabled && !!sensor,
        position: "top",
        onClick: (e) => e.native?.stopPropagation(),
      },
      title: {
        display: true,
        text: sensorName,
        color: theme.palette.primary.main,
        font: {
          size: titlefontSize,
          weight: "bold",
        },
      },
      zoom: zoomOptions,
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

        max: endDate.format("YYYY-MM-DD HH:mm:ss"),
        min: startDate.startOf("day").format("YYYY-MM-DD"),
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
      y1: {
        min: isCompareSensorValueBoolean ? 0 : undefined,
        max: isCompareSensorValueBoolean ? 1 : undefined,
        type: "linear",
        display: isCompareEnabled,
        position: "right",
        title: {
          display: true,
          text:
            "Value" + (compareSensorSymbol ? `(${compareSensorSymbol})` : ""),
          color: theme.palette.success.main,
          font: {
            size: titlefontSize,
            weight: "bold",
          },
          padding: 0,
        },
        ticks: {
          precision: 2,
          stepSize: isCompareSensorValueBoolean ? 1 : undefined,
          callback: isCompareSensorValueBoolean
            ? function (value) {
                return value === 1 ? "ON" : "OFF";
              }
            : undefined,
        },
        grid: {
          drawOnChartArea: false, // only want the grid lines for one axis to show up
        },
      },
    },
    onClick(_event, _elements, chart) {
      toggleZoom(chart, isMobile);
    },
  };

  return options;
};

export default createChartOptions;
