import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import { useRef } from "react";
import { PromiseArguments } from "../../entities/MuiDataGrid";

interface Props {
  type: string;

  promiseArguments: PromiseArguments | null;
  handleNoButton: () => void;
  handleYesButton: () => Promise<void>;
}

function ConfirmDialog({
  type,

  promiseArguments,
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

  if (!promiseArguments) {
    return null;
  }

  return (
    <Dialog
      maxWidth="sm"
      TransitionProps={{ onEntered: handleEntered }}
      open={!!promiseArguments}
    >
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogContent dividers>
        Pressing 'Yes' will Confirm the changes made to the {type}.
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

export default ConfirmDialog;
