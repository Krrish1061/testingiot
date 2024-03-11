import { z } from "zod";

const iotDeviceDetailSchema = z.object({
  name: z
    .string()
    .min(1, "This field is required")
    .max(255, "Length should be less than 255 character"),
  environment_type: z
    .string()
    .max(255, "Length should be less than 255 character")
    .nullish(),
  address: z
    .string()
    .max(255, "Length should be less than 255 character")
    .nullish(),
  description: z.string().nullish(),
});

export default iotDeviceDetailSchema;

export type IDeviceDetailFormInputs = z.infer<typeof iotDeviceDetailSchema>;
