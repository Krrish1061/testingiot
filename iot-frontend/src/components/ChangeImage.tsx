import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  SyntheticEvent,
  useEffect,
} from "react";
import ChangeImageBadge from "./ChangeImageBadge";
import ImageAvatar from "./ImageAvatar";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  file: string;
  setFile: Dispatch<SetStateAction<string>>;
  selectedImage: MutableRefObject<HTMLInputElement | null>;
  handleImageUpload: () => Promise<void>;
  isSuccess: boolean;
  isLoading: boolean;
}

function ChangeImage({
  open,
  setOpen,
  file,
  setFile,
  selectedImage,
  handleImageUpload,
  isSuccess,
  isLoading,
}: Props) {
  useEffect(() => {
    if (isSuccess) {
      if (selectedImage.current) {
        selectedImage.current.value = "";
      }
      setOpen(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  const handleClose = (_event: SyntheticEvent, reason: string) => {
    if (reason == "backdropClick") {
      return;
    }
    if (selectedImage.current) {
      selectedImage.current.value = "";
    }
    setOpen(false);
  };
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: 500, // Adjust the width as needed
        },
      }}
      maxWidth="md"
    >
      <DialogTitle mx="auto">Change Profile Picture</DialogTitle>
      <DialogContent sx={{ display: "flex", justifyContent: "center" }}>
        {/* do not pass ref from here only pass from parent component */}
        <ChangeImageBadge
          setOpen={setOpen}
          setFile={setFile}
          imageAvatar={
            <ImageAvatar
              imgUrl={file}
              altText="new profile pic"
              height={200}
              width={200}
            />
          }
        />
      </DialogContent>
      <DialogActions>
        <Button
          disabled={isLoading}
          onClick={(event) => handleClose(event, "cancel")}
        >
          Cancel
        </Button>
        <Box sx={{ position: "relative" }}>
          <Button disabled={isLoading} onClick={handleImageUpload}>
            Upload
          </Button>

          {isLoading && (
            <CircularProgress
              color="primary"
              size={30}
              thickness={5}
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                marginTop: "-12px",
                marginLeft: "-12px",
              }}
            />
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default ChangeImage;
