import { ZoomPluginOptions } from "chartjs-plugin-zoom/types/options";
import { Dayjs } from "dayjs";

const createZoomOptions = (
  startDate: Dayjs,
  endDate: Dayjs
): ZoomPluginOptions => ({
  limits: {
    x: {
      min: startDate.startOf("day").valueOf(),
      max: endDate.valueOf(),
      minRange: 60 * 60 * 1000,
    },
  },
  pan: {
    enabled: true,
    mode: "x",
  },
  zoom: {
    wheel: {
      enabled: false,
    },
    pinch: {
      enabled: true,
    },
    mode: "x",
  },
});

export default createZoomOptions;
