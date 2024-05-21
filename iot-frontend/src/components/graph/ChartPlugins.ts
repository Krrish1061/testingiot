import { Plugin } from "chart.js";

export const backgroundColorPlugin: Plugin<"line"> = {
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

export const chartBorderLinePlugin: Plugin<"line"> = {
  id: "chartAreaBorder",
  beforeDraw(chart, _args, options) {
    const {
      ctx,
      chartArea: { left, top, width, height },
    } = chart;
    if (chart.options.plugins?.zoom?.zoom?.wheel?.enabled) {
      ctx.save();
      ctx.strokeStyle = options.borderColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(left, top, width, height);
      ctx.restore();
    }
  },
};
