import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import { Dispatch, SetStateAction, SyntheticEvent } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import useAddSensor from "../../hooks/sensor/useAddSensor";
import Checkbox from "@mui/material/Checkbox";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const schema = z
  .object({
    name: z.string().min(1, "This field is required"),
    unit: z.string().min(1, "This field is required"),
    symbol: z.string().nullish(),
    is_value_boolean: z.boolean(),
    max_limit: z.coerce
      .string()
      .transform((value) => (value === "" ? null : Number(value)))
      .nullish()
      .refine((val) => !isNaN(val as number), { message: "Invalid Number" }),
    min_limit: z.coerce
      .string()
      .transform((value) => (value === "" ? null : Number(value)))
      .nullish()
      .refine((val) => !isNaN(val as number), { message: "Invalid Number" }),
  })
  .superRefine((data, ctx) => {
    if (data.max_limit && data.min_limit && data.max_limit <= data.min_limit) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "The maximum limit must be greater than the minimum limit, and vice versa.",
        path: ["max_limit"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "The maximum limit must be greater than the minimum limit, and vice versa.",
        path: ["min_limit"],
      });
    }
  });

type IFormInputs = z.infer<typeof schema>;

function AddSensorForm({ open, setOpen }: Props) {
  const { mutate } = useAddSensor();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<IFormInputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      is_value_boolean: false,
    },
  });

  const onSubmit: SubmitHandler<IFormInputs> = (data) => {
    mutate(data);
    reset();
    setOpen(false);
  };

  const handleClose = (_event: SyntheticEvent, reason: string) => {
    if (reason == "backdropClick") {
      return;
    }
    reset();
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: { xs: 320, sm: 500 },
        },
      }}
    >
      <DialogTitle mx="auto">ADD SENSOR</DialogTitle>
      <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box marginBottom={2}>
            <Typography
              component={InputLabel}
              htmlFor="sensorName"
              required
              gutterBottom
              color="inherit"
            >
              Sensor Name:
            </Typography>
            <TextField
              inputProps={{ ...register("name") }}
              id="sensorName"
              type="text"
              required
              fullWidth
              error={!!errors.name}
              helperText={errors.name && errors.name.message}
              autoComplete="off"
            />
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            marginBottom={2}
            spacing={2}
          >
            <Box>
              <Typography
                component={InputLabel}
                htmlFor="unit"
                required
                gutterBottom
                color="inherit"
              >
                Sensor Unit:
              </Typography>
              <TextField
                inputProps={{ ...register("unit") }}
                id="unit"
                type="text"
                required
                fullWidth
                error={!!errors.unit}
                helperText={errors.unit && errors.unit.message}
                autoComplete="on"
              />
            </Box>
            <Box>
              <Typography
                component={InputLabel}
                htmlFor="symbol"
                gutterBottom
                color="inherit"
              >
                Symbol:
              </Typography>
              <TextField
                inputProps={{ ...register("symbol") }}
                id="symbol"
                type="text"
                fullWidth
                error={!!errors.symbol}
                helperText={errors.symbol && errors.symbol.message}
                autoComplete="on"
              />
            </Box>
          </Stack>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            marginBottom={2}
            spacing={2}
          >
            <Box>
              <Typography
                component={InputLabel}
                htmlFor="max_value"
                gutterBottom
                color="inherit"
              >
                Sensor Max Limit:
              </Typography>
              <TextField
                inputProps={{
                  ...register("max_limit"),
                }}
                id="max_value"
                type="number"
                fullWidth
                autoComplete="off"
              />
            </Box>
            <Box>
              <Typography
                component={InputLabel}
                htmlFor="min_value"
                gutterBottom
                color="inherit"
              >
                Sensor Min Limit:
              </Typography>
              <TextField
                inputProps={{
                  ...register("min_limit"),
                }}
                id="min_value"
                type="number"
                fullWidth
                autoComplete="off"
              />
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              component={InputLabel}
              htmlFor="is_value_boolean"
              color="inherit"
            >
              Is Sensor Value Boolean:
            </Typography>

            <Controller
              name="is_value_boolean"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="is_value_boolean"
                  onChange={(e) => field.onChange(e.target.checked)}
                  checked={field.value}
                />
              )}
            />
          </Stack>
          {errors.max_limit && errors.min_limit ? (
            <Typography color="error" fontSize={12} paddingLeft={2}>
              {errors.max_limit
                ? errors.max_limit.message
                : errors.min_limit.message}
            </Typography>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={(event) => handleClose(event, "cancel")}>
            Cancel
          </Button>
          <Button type="submit">Submit</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default AddSensorForm;
