import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import {
  Dispatch,
  MouseEventHandler,
  SetStateAction,
  SyntheticEvent,
} from "react";
import IotDeviceStepper from "./IotDeviceStepper";
import DialogTitle from "@mui/material/DialogTitle";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

function IotDeviceDialog({ open, setOpen }: Props) {
  const handleClose = (
    _event: SyntheticEvent | MouseEventHandler,
    reason?: string
  ) => {
    if (reason == "backdropClick") {
      return;
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={handleClose} scroll="body" maxWidth="md">
      <DialogTitle textAlign="center">ADD IOT DEVICE</DialogTitle>
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
        <IotDeviceStepper />
      </DialogContent>
    </Dialog>
  );
}

export default IotDeviceDialog;
