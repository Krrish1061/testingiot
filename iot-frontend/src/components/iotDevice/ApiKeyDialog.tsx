import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { enqueueSnackbar } from "notistack";
import Typography from "@mui/material/Typography";

interface Props {
  open: boolean;
  apiKey: string | undefined;
  deviceId: number | null;
  onClose: () => void;
}

function ApiKeyDialog({ open, apiKey, deviceId, onClose }: Props) {
  const CopyToClipboardButton = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      enqueueSnackbar("Copied to clipboard", {
        variant: "success",
      });
      onClose();
    }
  };
  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle mx="auto" sx={{ display: { xs: "none", sm: "block" } }}>
        API-KEY of IOT DEVICE {deviceId}
      </DialogTitle>
      <DialogContent
        sx={{ paddingX: 1, paddingTop: 1, paddingBottom: { xs: 0, sm: 1 } }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="center"
          alignItems="center"
          sx={{ display: { xs: "none", sm: "flex" } }}
        >
          <Typography>API-KEY:</Typography>
          <Typography>{apiKey}</Typography>
          <IconButton size="small" onClick={CopyToClipboardButton}>
            <Tooltip arrow placement="top" title="copy to clipboard">
              <ContentCopyIcon fontSize="small" />
            </Tooltip>
          </IconButton>
        </Stack>
        <Button
          sx={{
            textTransform: "none",
            display: { xs: "block", sm: "none" },
            fontSize: 12,
            paddingX: 0,
          }}
          onClick={CopyToClipboardButton}
        >
          {apiKey}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default ApiKeyDialog;
