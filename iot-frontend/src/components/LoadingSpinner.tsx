import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";

function LoadingSpinner() {
  return (
    <Stack alignItems="center" justifyContent="center" height={1}>
      <CircularProgress variant="indeterminate" size={80} thickness={4} />
    </Stack>
  );
}

export default LoadingSpinner;
