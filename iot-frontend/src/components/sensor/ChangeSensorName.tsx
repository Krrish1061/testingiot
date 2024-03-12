import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import {
  Dispatch,
  MouseEventHandler,
  SetStateAction,
  SyntheticEvent,
} from "react";
import { z } from "zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import Autocomplete from "@mui/material/Autocomplete";
import useGetAllSensors from "../../hooks/sensor/useGetAllSensors";
import useChangeSensorName from "../../hooks/sensor/useChangeSensorName";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const schema = z.object({
  sensor_name: z
    .string({ required_error: "This field is required" })
    .min(1, "This field is required"),
  new_name: z.string().min(1, "This field is required"),
});

type IFormInputs = z.infer<typeof schema>;

function ChangeSensorName({ open, setOpen }: Props) {
  const { mutate, isLoading } = useChangeSensorName();
  const { data: sensorList } = useGetAllSensors();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<IFormInputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      sensor_name: "",
      new_name: "",
    },
  });

  const onSubmit: SubmitHandler<IFormInputs> = (data) => {
    console.log(data);
    mutate(data);
  };

  const handleClose = (
    _event: SyntheticEvent | MouseEventHandler,
    reason?: string
  ) => {
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
        component: "form",
        onSubmit: handleSubmit(onSubmit),
        sx: {
          width: 400,
        },
      }}
    >
      <DialogTitle mx="auto">Change Sensor Name</DialogTitle>
      <IconButton
        onClick={handleClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent>
        <Box marginBottom={2}>
          <InputLabel sx={{ color: "inherit" }} htmlFor="oldSensorName">
            Select Sensor:
          </InputLabel>

          <Controller
            name="sensor_name"
            control={control}
            render={({ field }) => (
              <Autocomplete
                {...field}
                id="oldSensorName"
                options={sensorList ?? []}
                getOptionLabel={(option) => option.name}
                value={
                  sensorList?.find((item) => field.value === item.name) || null
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    type="text"
                    error={!!errors.sensor_name}
                    helperText={errors.sensor_name?.message}
                  />
                )}
                onChange={(_, data) => field.onChange(data?.name)}
              />
            )}
          />
        </Box>
        <Box marginBottom={2}>
          <InputLabel htmlFor="newSensorName" sx={{ color: "inherit" }}>
            New Sensor Name:
          </InputLabel>
          <TextField
            inputProps={{ ...register("new_name") }}
            id="newSensorName"
            type="text"
            fullWidth
            error={!!errors.new_name}
            helperText={errors.new_name && errors.new_name.message}
            autoComplete="off"
          />
        </Box>
        <Box
          sx={{
            position: "relative",
            marginTop: 2,
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
          <Button type="button" disabled={isLoading} onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            Submit
          </Button>
          {isLoading && (
            <CircularProgress
              color="primary"
              size={30}
              thickness={5}
              sx={{
                position: "absolute",
                top: "50%",
                right: "15%",
                marginTop: "-12px",
                marginRight: "-12px",
              }}
            />
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default ChangeSensorName;
