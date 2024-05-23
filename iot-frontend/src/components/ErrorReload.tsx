import ReplayIcon from "@mui/icons-material/Replay";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

interface Props {
  text?: string;
  handleRefetch: () => void;
}

function ErrorReload({ text, handleRefetch }: Props) {
  return (
    <Box
      margin={2}
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Typography color="error.main">{text}</Typography>
      <Button startIcon={<ReplayIcon />} onClick={handleRefetch}>
        Retry
      </Button>
    </Box>
  );
}

export default ErrorReload;
