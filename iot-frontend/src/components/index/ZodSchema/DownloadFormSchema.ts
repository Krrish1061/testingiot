import { z } from "zod";
import dayjs from "dayjs";

const DownloadFormSchema = z
  .object({
    start_date: z.coerce
      .date()
      .nullable()
      .refine((value) => value !== null, {
        message: "This field is required",
      }),
    end_date: z.coerce
      .date()
      .nullable()
      .refine((value) => value !== null, {
        message: "This field is required",
      }),
    user: z.string().nullish().or(z.string().array()),
    company: z.string().nullish().or(z.string().array()),
    sensors: z
      .string()
      .array()
      .or(z.string())
      .refine(
        (value) => {
          if (Array.isArray(value)) {
            if (value.length === 0) return false;
          }
          return true;
        },
        {
          message: "This field is required",
        }
      ),
    file_type: z.string().min(1, "File Type is required"),
  })
  .refine(
    (value) =>
      (value.start_date &&
        value.end_date &&
        dayjs(value.start_date).isSame(dayjs(value.end_date), "day")) ||
      dayjs(value.start_date).isBefore(dayjs(value.end_date), "day"),
    {
      path: ["start_date"],

      message: "start date must be smaller than or equal to end date",
    }
  );

export type IDownloadFormInputs = z.infer<typeof DownloadFormSchema>;

export default DownloadFormSchema;
