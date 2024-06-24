import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import { MouseEventHandler, SyntheticEvent } from "react";

interface Props {
  handleClose: (
    _event: SyntheticEvent | MouseEventHandler,
    reason?: string
  ) => void;
  top?: string | number;
  bottom?: string | number;
  left?: string | number;
  right?: string | number;
}

function CloseIconButton({ handleClose, top, bottom, left, right }: Props) {
  return (
    <IconButton
      onClick={handleClose}
      sx={{
        position: "absolute",
        top: top,
        bottom: bottom,
        left: left,
        right: right,
      }}
    >
      <CloseIcon />
    </IconButton>
  );
}

export default CloseIconButton;
