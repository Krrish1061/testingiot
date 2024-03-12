import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import { SnackbarProvider, closeSnackbar } from "notistack";
import { Outlet } from "react-router-dom";
import { ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";

function App() {
  const { theme, colorMode } = useMode();

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <Container
          maxWidth={false}
          // maxWidth="md"
          sx={{
            // height: window.innerHeight,
            height: "100dvh",
            minWidth: 320,
          }}
          disableGutters
        >
          <CssBaseline enableColorScheme />
          <SnackbarProvider
            preventDuplicate
            autoHideDuration={3000}
            maxSnack={3}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            action={(snackbarId) => (
              <Button onClick={() => closeSnackbar(snackbarId)}>
                <CloseIcon sx={{ color: "white" }} />
              </Button>
            )}
          >
            <Outlet />
          </SnackbarProvider>
        </Container>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
