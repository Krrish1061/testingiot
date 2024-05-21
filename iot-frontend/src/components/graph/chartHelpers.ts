import { Chart as ChartJS, ChartTypeRegistry } from "chart.js";
import dayjs from "dayjs";
import ISensorData from "../../entities/webSocket/SensorData";

export const toggleZoom = (
  chart: ChartJS<keyof ChartTypeRegistry>,
  isMobile: boolean
) => {
  const zoomOptions = chart.options.plugins?.zoom?.zoom?.wheel;
  if (zoomOptions && !isMobile) {
    zoomOptions.enabled = !zoomOptions.enabled;
    chart.update();
  }
};

export const processData = (data: ISensorData[]) =>
  data.map((entry) => ({
    x: dayjs(entry.date_time).valueOf(),
    y: entry.value,
  }));
