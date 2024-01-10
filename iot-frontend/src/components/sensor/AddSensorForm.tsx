import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import { Dispatch, SetStateAction, SyntheticEvent } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
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

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const schema = z.object({
  name: z.string().min(1, "This field is required"),
  unit: z.string().min(1, "This field is required"),
  symbol: z.string().nullish(),
  max_value: z.coerce.number().nullish(),
  min_value: z.coerce.number().nullish(),
});

type IFormInputs = z.infer<typeof schema>;

function AddSensorForm({ open, setOpen }: Props) {
  const { mutate } = useAddSensor();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IFormInputs>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<IFormInputs> = (data) => {
    console.log("onSubmit", data);
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

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Box marginBottom={2}>
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
            <Box marginBottom={2}>
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
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Box marginBottom={2}>
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
                  ...register("max_value"),
                }}
                id="max_value"
                type="number"
                fullWidth
                error={!!errors.max_value}
                helperText={errors.max_value && errors.max_value.message}
                autoComplete="off"
              />
            </Box>
            <Box marginBottom={2}>
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
                  ...register("min_value"),
                }}
                id="min_value"
                type="number"
                fullWidth
                error={!!errors.min_value}
                helperText={errors.min_value && errors.min_value.message}
                autoComplete="off"
              />
            </Box>
          </Stack>
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
