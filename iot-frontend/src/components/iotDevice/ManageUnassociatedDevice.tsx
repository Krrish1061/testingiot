import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import InputLabel from "@mui/material/InputLabel";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import {
  Dispatch,
  MouseEventHandler,
  SetStateAction,
  SyntheticEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import IotDevice from "../../entities/IotDevice";
import useGetAllIotDevice from "../../hooks/iotDevice/useGetAllIotDevice";
import useGetIotDeviceApiKey from "../../hooks/iotDevice/useGetIotDeviceApiKey";
import useGetIotDeviceSensorByDeviceId from "../../hooks/iotDevice/useGetIotDeviceSensorByDeviceId";
import CloseIconButton from "../CloseButton";
import ApiKeyDialog from "./ApiKeyDialog";
import IotDeviceDetailDialog from "./IotDeviceDetailDialog";
import UpdateDeviceSensorDialog from "./UpdateDeviceSensorDialog";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

function ManageUnassociatedDevice({ open, setOpen }: Props) {
  const [iotDevice, setIotDevice] = useState<IotDevice | null>(null);
  const [updateDeviceDetail, setUpdateDeviceDetail] =
    useState<IotDevice | null>(null);
  const [openApiKey, setOpenApiKey] = useState(false);
  const [fetchDeviceKey, setFetchDeviceKey] = useState<number | null>(null);
  const [openDeviceSensor, setOpenDeviceSensor] = useState(false);
  const [fetchDeviceSensor, setFetchDeviceSensor] = useState<number | null>(
    null
  );
  const {
    data: apiKey,
    isSuccess: apiKeySuccess,
    isFetching: apiKeyIsFetching,
  } = useGetIotDeviceApiKey(fetchDeviceKey);
  const { data: iotDeviceList } = useGetAllIotDevice();
  const {
    data: deviceSensorList,
    isInitialLoading: isFetchingDeviceSensors,
    isSuccess: isFetchingDeviceSensorSuccess,
  } = useGetIotDeviceSensorByDeviceId(fetchDeviceSensor);

  const unAssociatedIotDeviceList = useMemo(
    () =>
      iotDeviceList?.filter(
        (iotDevice) => !iotDevice.user && !iotDevice.company
      ) || [],
    [iotDeviceList]
  );

  const handleDialogClose = (
    _event: SyntheticEvent | MouseEventHandler,
    reason?: string
  ) => {
    if (reason == "backdropClick") {
      return;
    }
    setOpen(false);
    setIotDevice(null);
    setOpenApiKey(false);
    setFetchDeviceKey(null);
  };

  useEffect(() => {
    if (apiKeySuccess) {
      setOpenApiKey(true);
    }
  }, [apiKeySuccess, setOpen]);

  useEffect(() => {
    if (isFetchingDeviceSensorSuccess) {
      setOpenDeviceSensor(true);
    }
  }, [isFetchingDeviceSensorSuccess, setOpenDeviceSensor]);

  useEffect(() => {
    if (iotDevice) {
      const device = iotDeviceList?.find(
        (device) => device.id === iotDevice.id
      );
      if (device) setIotDevice(device);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iotDeviceList, setIotDevice]);

  const handleApiKeyDialogClose = () => {
    setOpenApiKey(false);
    setFetchDeviceKey(null);
  };

  const handleApiKeyButton = (id: number | null) => {
    setFetchDeviceKey(id);
  };

  const handleEditIotdeviceDetailButton = (editIotDevice: IotDevice | null) => {
    if (editIotDevice) setUpdateDeviceDetail(editIotDevice);
  };

  const handleDeviceSensorDialogClose = () => {
    setOpenDeviceSensor(false);
    setFetchDeviceSensor(null);
  };

  const handleEditDeviceSensorButton = (id: number | null) => {
    setFetchDeviceSensor(id);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleDialogClose}
        PaperProps={{
          sx: {
            width: 400,
          },
        }}
      >
        <DialogTitle mx="auto">Manage UnAssociated Iot Device</DialogTitle>
        <CloseIconButton handleClose={handleDialogClose} right={8} top={8} />
        <DialogContent sx={{ position: "relative" }}>
          <Box marginBottom={2}>
            <InputLabel sx={{ color: "inherit" }} htmlFor="iot_device" required>
              Iot Device:
            </InputLabel>
            <Autocomplete
              id="iot_device"
              disabled={apiKeyIsFetching || isFetchingDeviceSensors}
              options={unAssociatedIotDeviceList}
              getOptionLabel={(option) =>
                option.iot_device_details.name || option.id.toString()
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={iotDevice}
              onChange={(_, newValue) => {
                setIotDevice(newValue);
              }}
              renderInput={(params) => <TextField {...params} />}
            />
          </Box>
          <Stack
            direction="row"
            justifyContent="space-evenly"
            spacing={2}
            paddingTop={1}
          >
            <Button
              disabled={
                !iotDevice || apiKeyIsFetching || isFetchingDeviceSensors
              }
              onClick={() => handleApiKeyButton(iotDevice?.id || null)}
            >
              Get Api-key
            </Button>
            <Button
              disabled={
                !iotDevice || apiKeyIsFetching || isFetchingDeviceSensors
              }
              onClick={() => handleEditIotdeviceDetailButton(iotDevice)}
            >
              Edit Iot Device Detail
            </Button>
            <Button
              disabled={
                !iotDevice || apiKeyIsFetching || isFetchingDeviceSensors
              }
              onClick={() =>
                handleEditDeviceSensorButton(iotDevice?.id || null)
              }
            >
              Edit Associated Device Sensor
            </Button>
          </Stack>
          {(apiKeyIsFetching || isFetchingDeviceSensors) && (
            <CircularProgress
              color="primary"
              size={30}
              thickness={5}
              sx={{
                position: "absolute",
                top: "35%",
                right: "15%",
                marginTop: "-15px",
                marginLeft: "-15px",
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      <ApiKeyDialog
        open={openApiKey}
        onClose={handleApiKeyDialogClose}
        apiKey={apiKey?.api_key}
        deviceId={fetchDeviceKey}
      />
      <IotDeviceDetailDialog
        open={!!updateDeviceDetail}
        iotDevice={updateDeviceDetail}
        setIotDevice={setUpdateDeviceDetail}
      />

      <UpdateDeviceSensorDialog
        open={openDeviceSensor}
        iotDeviceId={fetchDeviceSensor}
        deviceSensorList={deviceSensorList}
        onClose={handleDeviceSensorDialogClose}
      />
    </>
  );
}

export default ManageUnassociatedDevice;
