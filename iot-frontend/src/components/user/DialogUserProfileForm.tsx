import CloseIcon from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import {
  Dispatch,
  MouseEventHandler,
  SetStateAction,
  SyntheticEvent,
  useRef,
  useState,
} from "react";
import useUploadProfileImage from "../../hooks/users/useUploadProfileImage";
import useAuthStore from "../../store/authStore";
import useDrawerStore from "../../store/drawerStore";
import ChangeImage from "../ChangeImage";
import ChangeImageBadge from "../ChangeImageBadge";
import ImageAvatar from "../ImageAvatar";
import ViewProfileForm from "./ViewProfileForm";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

function DialogUserProfileForm({ open, setOpen }: Props) {
  /**
   * This component renders a dialog userProfile form
   * @description Only renders when User hasn't set their name
   * @returns {ReactNode} A Dialog that renders user profile form
   */

  const [openDialogImage, setOpenDialogImage] = useState(false);
  const [file, setFile] = useState<string>("");
  const user = useAuthStore((state) => state.user);
  const selectedImage = useRef<HTMLInputElement | null>(null);
  const isMobile = useDrawerStore((state) => state.isMobile);
  const { mutateAsync, isSuccess, isLoading } = useUploadProfileImage();

  const handleImageUpload = async () => {
    if (selectedImage.current && selectedImage.current.files) {
      await mutateAsync({ profile_picture: selectedImage.current.files[0] });
    }
  };

  // const handleClose = () => {
  //   setOpen(false);
  // };
  const handleClose = (
    _event: SyntheticEvent | MouseEventHandler<HTMLAnchorElement>,
    reason?: string
  ) => {
    if (reason == "backdropClick") {
      return;
    }
    setOpen(false);
  };

  const imageAvatar = (
    <ImageAvatar
      imgUrl={user?.profile?.profile_picture}
      altText={
        user?.profile?.first_name
          ? `${user?.profile?.first_name} ${user?.profile?.last_name}`
          : user?.username
      }
      height={200}
      width={200}
    />
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      scroll="body"
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          backgroundImage: "none",
        },
      }}
    >
      <DialogTitle textAlign="center">Update Your Profile</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={handleClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      <ChangeImageBadge
        setOpen={setOpenDialogImage}
        setFile={setFile}
        selectedImage={selectedImage}
        imageAvatar={imageAvatar}
      />
      <ChangeImage
        open={openDialogImage}
        setOpen={setOpenDialogImage}
        file={file}
        setFile={setFile}
        selectedImage={selectedImage}
        handleImageUpload={handleImageUpload}
        isSuccess={isSuccess}
        isLoading={isLoading}
      />
      <ViewProfileForm />
    </Dialog>
  );
}

export default DialogUserProfileForm;
