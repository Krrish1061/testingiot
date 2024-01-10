import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import { useRef } from "react";

interface Props {
  type: string;
  name?: string;
  open: boolean;
  handleNoButton: () => void;
  handleYesButton: () => void;
}

function DeleteDialog({
  type,
  name,
  open,
  handleNoButton,
  handleYesButton,
}: Props) {
  const noButtonRef = useRef<HTMLButtonElement>(null);

  const handleEntered = () => {
    // The `autoFocus` is not used because, if used, the same Enter that saves
    // the cell triggers "No". Instead, we manually focus the "No" button once
    // the dialog is fully open.
    noButtonRef.current?.focus();
  };

  return (
    <Dialog
      maxWidth="xs"
      TransitionProps={{ onEntered: handleEntered }}
      open={open}
    >
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogContent dividers>
        Pressing 'Yes' will Delete the {type} {name}.
      </DialogContent>
      <DialogActions>
        <Button ref={noButtonRef} onClick={handleNoButton}>
          No
        </Button>
        <Button onClick={handleYesButton}>Yes</Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteDialog;
