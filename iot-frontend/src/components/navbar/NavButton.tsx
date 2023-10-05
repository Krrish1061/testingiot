import Fab from "@mui/material/Fab";
import Typography from "@mui/material/Typography";
import { ReactNode } from "react";

interface NavButton {
  icon: ReactNode;
  label: string;
}

function NavButton({ icon, label }: NavButton) {
  return (
    <Fab
      variant="extended"
      size="small"
      color="primary"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {icon} <Typography>{label}</Typography>
    </Fab>
  );
}

export default NavButton;
