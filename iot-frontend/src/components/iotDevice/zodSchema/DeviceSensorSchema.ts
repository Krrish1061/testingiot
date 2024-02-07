import { z } from "zod";

const SensorFieldSchema = z
  .object({
    sensor_name: z.string().min(1, "sensor field is required"),
    max_limit: z.number().nullable(),
    min_limit: z.number().nullable(),
  })
  .refine(
    (data) =>
      data.max_limit === null ||
      data.min_limit === null ||
      data.max_limit > data.min_limit,
    {
      message:
        "max limit must be greater than min limit and min limit must be smaller than max limit",
    }
  );

const DeviceSensorSchema = z
  .record(z.string(), SensorFieldSchema)
  .superRefine((val, ctx) => {
    const errorMessage = "Each field should have a unique sensor.";
    const seen = new Set();
    const duplicateValues = new Set();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(val).forEach(([_key, value]) => {
      const sensor_name = value.sensor_name;
      if (sensor_name && seen.has(sensor_name)) {
        duplicateValues.add(sensor_name);
      } else {
        seen.add(sensor_name);
      }
    });

    Object.entries(val).forEach(([key, value]) => {
      const sensor_name = value.sensor_name;
      if (sensor_name && duplicateValues.has(sensor_name)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: errorMessage,
          path: [key],
        });
      }
    });
  });

export default DeviceSensorSchema;
