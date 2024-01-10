import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

interface Props {
  name: string;
  open: boolean;
  handleNoButton: () => void;
  handleYesButton: () => void;
}

function MobileConfirmDialog({
  name,
  open,
  handleYesButton,
  handleNoButton,
}: Props) {
  return (
    <Dialog maxWidth="xs" open={open}>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogContent dividers>
        Pressing 'Yes' will Confirm the changes made to the {name}.
      </DialogContent>
      <DialogActions>
        <Button onClick={handleNoButton}>No</Button>
        <Button onClick={handleYesButton}>Yes</Button>
      </DialogActions>
    </Dialog>
  );
}

export default MobileConfirmDialog;
