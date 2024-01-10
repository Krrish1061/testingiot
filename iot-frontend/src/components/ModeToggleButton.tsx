import { useContext } from "react";
import { ColorModeContext } from "../theme";
import { useTheme } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

//  not in use in any component
function ModeToggleButton() {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  return (
    <IconButton
      onClick={colorMode.toggleColorMode}
      color="inherit"
      size="small"
    >
      {theme.palette.mode === "dark" ? (
        <Brightness7Icon fontSize="small" />
      ) : (
        <Brightness4Icon fontSize="small" />
      )}
    </IconButton>
  );
}

export default ModeToggleButton;
