import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import { SnackbarProvider, closeSnackbar } from "notistack";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import useRefreshToken from "../hooks/useRefreshToken";
import LoadingSpinner from "../components/LoadingSpinner";

function ProtectedAppLayout() {
  const { mutate, isError, isSuccess } = useRefreshToken();

  useEffect(() => {
    mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <CssBaseline />
      <Container
        maxWidth={false}
        sx={{
          // height: window.innerHeight,
          height: "100dvh",
          minWidth: 320,
        }}
        disableGutters
      >
        <SnackbarProvider
          // preventDuplicate
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
          {isSuccess || isError ? <Outlet /> : <LoadingSpinner />}
        </SnackbarProvider>
      </Container>
    </>
  );
}

export default ProtectedAppLayout;
