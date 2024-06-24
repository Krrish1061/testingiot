import { Chart as ChartJS, ChartTypeRegistry } from "chart.js";
import dayjs from "dayjs";
import ISensorData from "../../entities/webSocket/SensorData";

export const toggleZoom = (
  chart: ChartJS<keyof ChartTypeRegistry>,
  isMobile: boolean
) => {
  const zoomOptions = chart.options.plugins?.zoom?.zoom?.wheel;
  const pinchOptions = chart.options.plugins?.zoom?.zoom?.pinch;
  if (zoomOptions && pinchOptions && !isMobile) {
    zoomOptions.enabled = !zoomOptions.enabled;
    pinchOptions.enabled = !pinchOptions.enabled;
    chart.update();
  }
};

export const processData = (data: ISensorData[]) =>
  data.map((entry) => ({
    x: dayjs(entry.date_time).valueOf(),
    y: entry.value,
  }));
