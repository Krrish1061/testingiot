import Dialog from "@mui/material/Dialog";
import {
  Dispatch,
  SetStateAction,
  SyntheticEvent,
  ChangeEvent,
  MutableRefObject,
} from "react";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import EditIcon from "@mui/icons-material/Edit";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import useUpdateCompanyProfile from "../../hooks/company/useUpdateCompanyProfile";
import VisuallyHiddenInput from "../styledComponents/VisuallyHiddenInput";
import ImageAvatar from "../ImageAvatar";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  file: string;
  setFile: Dispatch<SetStateAction<string>>;
  selectedImage: MutableRefObject<HTMLInputElement | null>;
}

function ChangeCompanyLogo({
  open,
  setOpen,
  file,
  setFile,
  selectedImage,
}: Props) {
  const { mutateAsync, isSuccess, isLoading } = useUpdateCompanyProfile();

  const handleImageUpload = async () => {
    if (selectedImage.current && selectedImage.current.files) {
      await mutateAsync({ logo: selectedImage.current.files[0] });
    }

    if (isSuccess) {
      setOpen(false);
    }
  };
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files;
    if (file) {
      setFile(URL.createObjectURL(file[0]));
      setOpen(true);
      if (selectedImage.current) {
        selectedImage.current.files = file;
      }
    }
  };
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
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          badgeContent={
            <IconButton
              // watch button file upload mui webpage
              size="small"
              component="label"
              sx={{
                bgcolor: "primary.main",
                "&:hover": {
                  bgcolor: "secondary.dark",
                },
              }}
            >
              <EditIcon fontSize="inherit" sx={{ color: "white" }} />
              <VisuallyHiddenInput
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </IconButton>
          }
        >
          <ImageAvatar
            imgUrl={file}
            altText="new profile pic"
            height={200}
            width={200}
          />
        </Badge>
      </DialogContent>
      <DialogActions>
        <Button onClick={(event) => handleClose(event, "cancel")}>
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

export default ChangeCompanyLogo;
