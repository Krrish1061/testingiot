import Dialog from "@mui/material/Dialog";
import { Dispatch, ReactNode, SetStateAction } from "react";
import DialogContent from "@mui/material/DialogContent";

export interface DialogProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  children: ReactNode;
}

function MobileSearchBar({ open, setOpen, children }: DialogProps) {
  const handleClose = () => {
    setOpen(!open);
  };

  return (
    <Dialog onClose={handleClose} fullScreen open={open}>
      <DialogContent>
        {/* add back button */}
        {children}
      </DialogContent>
    </Dialog>
  );
}

export default MobileSearchBar;
