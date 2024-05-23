import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";

interface Props {
  size?: number;
  thickness?: number;
}

function LoadingSpinner({ size = 40, thickness }: Props) {
  return (
    <Stack alignItems="center" justifyContent="center" height={1} margin={2}>
      <CircularProgress
        variant="indeterminate"
        size={size}
        thickness={thickness}
      />
    </Stack>
  );
}

export default LoadingSpinner;
