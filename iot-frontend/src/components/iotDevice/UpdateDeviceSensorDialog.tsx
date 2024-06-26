import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IotDeviceSensor from "../../entities/IotDeviceSensor";
import CloseIconButton from "../CloseButton";
import UpdateIotDeviceSensor from "./UpdateIotDeviceSensor";

interface Props {
  open: boolean;
  iotDeviceId: number | null;
  deviceSensorList: IotDeviceSensor[] | undefined;
  onClose: () => void;
}

function UpdateDeviceSensorDialog({
  open,
  iotDeviceId,
  deviceSensorList,
  onClose,
}: Props) {
  if (!iotDeviceId || !deviceSensorList) return;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth={true}>
      <DialogTitle mx="auto">Manage Associated Iot Device Sensor</DialogTitle>
      <CloseIconButton handleClose={onClose} right={8} top={8} />
      <DialogContent sx={{ paddingY: 0 }}>
        <UpdateIotDeviceSensor
          iotDeviceId={iotDeviceId}
          iotDeviceSensors={deviceSensorList}
        />
      </DialogContent>
    </Dialog>
  );
}

export default UpdateDeviceSensorDialog;
