import { z } from "zod";

const iotDeviceschema = z
  .object({
    user: z.string().nullish(),
    company: z.string().nullish(),
    dealer: z.string().nullish(),
    board_id: z.coerce
      .string()
      .transform((value) => (value === "" ? null : Number(value)))
      .nullish(),
    is_active: z.boolean(),
  })
  .superRefine((val, ctx) => {
    if (isNaN(val.board_id as number)) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_type,
        message: "Invalid Number",
        expected: "number",
        received: typeof val.board_id,
        path: ["board_id"],
      });
    } else if (typeof val.board_id === "number" && val.board_id <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "only positive value is accepted",
        path: ["board_id"],
      });
    }

    const errorMessage =
      "Either user or company should have a value, but not both";
    if (!val.user && !val.company && !val.dealer) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: errorMessage,
        path: ["user"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: errorMessage,
        path: ["company"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "This field is required if both user and company is not selected",
        path: ["dealer"],
      });
    } else if (val.user && val.company) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: errorMessage,
        path: ["user"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: errorMessage,
        path: ["company"],
      });
    }
  });

export type IDeviceFormInputs = z.infer<typeof iotDeviceschema>;

export default iotDeviceschema;
