import { zodResolver } from "@hookform/resolvers/zod";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
  Dispatch,
  MouseEventHandler,
  SetStateAction,
  SyntheticEvent,
  useEffect,
  useState,
} from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import UserGroups from "../../constants/userGroups";
import IotDevice from "../../entities/IotDevice";
import useUpdateIotDeviceDetail from "../../hooks/iotDevice/useUpdateIotDeviceDetail";
import useAuthStore from "../../store/authStore";
import iotDeviceDetailSchema, {
  IDeviceDetailFormInputs,
} from "./zodSchema/IotDeviceDetailSchema";

interface Props {
  open: boolean;
  iotDevice: IotDevice | null;
  setIotDevice: Dispatch<SetStateAction<IotDevice | null>>;
}

function IotDeviceDetailDialog({ open, iotDevice, setIotDevice }: Props) {
  const user = useAuthStore((state) => state.user);
  const [isEditMode, setIsEditMode] = useState(false);
  const noValue = "N/A";
  const {
    mutate,
    data: deviceDetail,
    isSuccess,
    isLoading,
  } = useUpdateIotDeviceDetail();
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<IDeviceDetailFormInputs>({
    resolver: zodResolver(iotDeviceDetailSchema),
  });

  const allowEdit =
    user &&
    user.groups.some(
      (group) =>
        group === UserGroups.superAdminGroup || group === UserGroups.adminGroup
    );

  const onSubmit: SubmitHandler<IDeviceDetailFormInputs> = (data) => {
    if (iotDevice) {
      const deviceDetails = iotDevice.iot_device_details;
      const { name, environment_type, address, description } = data;
      const isDifferentName = name !== deviceDetails?.name;
      const isDifferentEnvironment =
        environment_type !== deviceDetails?.environment_type;
      const isDifferentAddress =
        (address || deviceDetails?.address) &&
        address !== deviceDetails?.address;
      const isDifferentDescription =
        (description || deviceDetails?.description) &&
        description !== deviceDetails?.description;

      const isSendRequest =
        isDifferentName ||
        isDifferentEnvironment ||
        isDifferentAddress ||
        isDifferentDescription;

      if (isSendRequest)
        mutate({ device_id: iotDevice?.id, device_detail: data });
      else setIsEditMode(false);
    }
  };

  const handleClose = (
    _event: SyntheticEvent | MouseEventHandler,
    reason?: string
  ) => {
    if (reason == "backdropClick") {
      return;
    }
    setIotDevice(null);
    setIsEditMode(false);
  };

  const handleCancelClick = () => {
    setIsEditMode(false);
    reset({
      name: iotDevice?.iot_device_details?.name || "",
      environment_type: iotDevice?.iot_device_details?.environment_type,
      address: iotDevice?.iot_device_details?.address,
      description: iotDevice?.iot_device_details?.description,
    });
  };

  useEffect(() => {
    if (iotDevice) {
      reset({
        name: iotDevice?.iot_device_details?.name || "",
        environment_type: iotDevice?.iot_device_details?.environment_type,
        address: iotDevice?.iot_device_details?.address,
        description: iotDevice?.iot_device_details?.description,
      });
    }
  }, [iotDevice, reset]);

  useEffect(() => {
    if (deviceDetail && iotDevice) {
      setIotDevice({ ...iotDevice, iot_device_details: deviceDetail });
    }
    setIsEditMode(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      scroll="body"
      maxWidth="md"
      PaperProps={{
        component: isEditMode ? "form" : "div",
        onSubmit: handleSubmit(onSubmit),
        sx: {
          width: { xs: 320, sm: 500 },
        },
      }}
    >
      <DialogTitle textAlign="center">IOT DEVICE DETAIL</DialogTitle>
      <IconButton
        onClick={handleClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 10,
        }}
      >
        <CloseIcon />
      </IconButton>
      {allowEdit && (
        <Stack direction="row" justifyContent="flex-end" paddingRight={1}>
          {isEditMode ? (
            <Box sx={{ position: "relative" }}>
              <Button
                size="small"
                startIcon={<SaveIcon />}
                type="submit"
                disabled={isLoading}
              >
                save
              </Button>
              <Button
                size="small"
                startIcon={<CloseIcon />}
                disabled={isLoading}
                onClick={handleCancelClick}
              >
                cancel
              </Button>
              {isLoading && (
                <CircularProgress
                  color="primary"
                  size={30}
                  thickness={5}
                  sx={{
                    position: "absolute",
                    top: "50%",
                    right: "45%",
                    marginTop: "-12px",
                    marginRight: "-12px",
                  }}
                />
              )}
            </Box>
          ) : (
            <Button
              size="small"
              startIcon={<EditIcon />}
              onClick={() => setIsEditMode(true)}
            >
              edit
            </Button>
          )}
        </Stack>
      )}

      <DialogContent>
        <Stack direction="column" marginBottom={2}>
          <Typography
            component={isEditMode ? InputLabel : "div"}
            htmlFor="deviceName"
            sx={{ color: "inherit", fontWeight: "bold" }}
          >
            Name:
          </Typography>
          {!isEditMode ? (
            <Typography sx={{ color: "inherit" }}>
              {iotDevice?.iot_device_details?.name || noValue}
            </Typography>
          ) : (
            <TextField
              inputProps={{
                ...register("name"),
              }}
              id="deviceName"
              size="small"
              type="text"
              fullWidth
              FormHelperTextProps={{ sx: { color: "info.main" } }}
              autoComplete="off"
              error={!!errors.name}
              helperText={
                errors.name
                  ? errors.name.message
                  : "e.g. Kathmandu Greenhouse, Pokhara ColdStore"
              }
            />
          )}
        </Stack>
        <Stack direction="column" marginBottom={2}>
          <Typography
            component={isEditMode ? InputLabel : "div"}
            htmlFor="environment"
            sx={{ color: "inherit", fontWeight: "bold" }}
          >
            Environment Type:
          </Typography>
          {!isEditMode ? (
            <Typography sx={{ color: "inherit" }}>
              {iotDevice?.iot_device_details?.environment_type || noValue}
            </Typography>
          ) : (
            <Controller
              name="environment_type"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  id="environment"
                  size="small"
                  freeSolo
                  autoSelect
                  selectOnFocus
                  clearOnBlur
                  handleHomeEndKeys
                  options={EnvironmentType}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      error={!!errors.environment_type}
                      helperText={
                        errors.environment_type &&
                        errors.environment_type.message
                      }
                    />
                  )}
                  onChange={(_, data) => field.onChange(data)}
                />
              )}
            />
          )}
        </Stack>
        <Stack direction="column" marginBottom={2}>
          <Typography
            component={isEditMode ? InputLabel : "div"}
            htmlFor="address"
            sx={{ color: "inherit", fontWeight: "bold" }}
          >
            Device Location:
          </Typography>
          {!isEditMode ? (
            <Typography sx={{ color: "inherit" }}>
              {iotDevice?.iot_device_details?.address || noValue}
            </Typography>
          ) : (
            <TextField
              inputProps={{
                ...register("address"),
              }}
              id="address"
              size="small"
              type="text"
              fullWidth
              error={!!errors.address}
              helperText={errors.address && errors.address.message}
              autoComplete="address"
            />
          )}
        </Stack>
        <Stack direction="column">
          <Typography
            component={isEditMode ? InputLabel : "div"}
            htmlFor="description"
            sx={{ color: "inherit", fontWeight: "bold" }}
          >
            Description:
          </Typography>
          {!isEditMode ? (
            <Typography sx={{ color: "inherit" }}>
              {iotDevice?.iot_device_details?.description || noValue}
            </Typography>
          ) : (
            <TextField
              inputProps={{
                ...register("description"),
              }}
              id="description"
              multiline
              minRows={2}
              maxRows={6}
              fullWidth
              error={!!errors.description}
              helperText={errors.description && errors.description.message}
              autoComplete="off"
            />
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export default IotDeviceDetailDialog;

const EnvironmentType = [
  "Cold Store",
  "Greenhouse",
  "Water Tank",
  "Hydroponics",
  "Aquaponics",
  "Agriculture Field",
];
