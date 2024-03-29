import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import EditIcon from "@mui/icons-material/Edit";
import VisuallyHiddenInput from "./styledComponents/VisuallyHiddenInput";
import {
  ChangeEvent,
  Dispatch,
  MutableRefObject,
  ReactNode,
  SetStateAction,
} from "react";
import Stack from "@mui/material/Stack";

interface Props {
  setOpen: Dispatch<SetStateAction<boolean>>;
  setFile: Dispatch<SetStateAction<string>>;
  selectedImage?: MutableRefObject<HTMLInputElement | null>;
  imageAvatar: ReactNode;
}

function ChangeImageBadge({
  setOpen,
  setFile,
  selectedImage,
  imageAvatar,
}: Props) {
  const handleChangeImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files;
    if (file) {
      setFile(URL.createObjectURL(file[0]));
      setOpen(true);
      if (selectedImage && selectedImage.current) {
        selectedImage.current.files = file;
      }
    }
  };

  return (
    <Stack justifyContent="center" alignItems="center">
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        badgeContent={
          <IconButton
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
              ref={selectedImage}
              type="file"
              accept="image/*"
              onChange={handleChangeImage}
            />
          </IconButton>
        }
      >
        {imageAvatar}
      </Badge>
    </Stack>
  );
}

export default ChangeImageBadge;
