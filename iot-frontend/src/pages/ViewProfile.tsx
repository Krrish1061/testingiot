import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useRef, useState } from "react";
import ChangeImage from "../components/ChangeImage";
import ChangeImageBadge from "../components/ChangeImageBadge";
import ImageAvatar from "../components/ImageAvatar";
import ChangeEmailForm from "../components/user/ChangeEmailForm";
import ChangePasswordForm from "../components/user/ChangePasswordForm";
import ChangeUsernameForm from "../components/user/ChangeUsernameForm";
import ViewProfileForm from "../components/user/ViewProfileForm";
import useUploadProfileImage from "../hooks/users/useUploadProfileImage";
import useAuthStore from "../store/authStore";
import useDrawerStore from "../store/drawerStore";

function ViewProfile() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<string>("");
  const user = useAuthStore((state) => state.user);
  const isDrawerOpen = useDrawerStore((state) => state.isDrawerOpen);
  const selectedImage = useRef<HTMLInputElement | null>(null);

  const { mutateAsync, isSuccess, isLoading } = useUploadProfileImage();

  const handleImageUpload = async () => {
    if (selectedImage.current && selectedImage.current.files) {
      await mutateAsync({ profile_picture: selectedImage.current.files[0] });
    }
  };

  return (
    <Box>
      <Typography variant="h6" component="h1" m={1}>
        User Profile
      </Typography>

      <Stack
        direction={{
          xs: "column",
          sm: isDrawerOpen ? "column" : "row",
          md: "row",
        }}
        justifyContent="center"
        alignItems={{
          xs: "center",
          sm: isDrawerOpen ? "center" : "flex-start",
          md: "flex-start",
        }}
        spacing={2}
        marginTop={2}
        padding={2}
      >
        <Stack justifyContent="center" alignItems="center" spacing={3}>
          <ChangeImageBadge
            setOpen={setOpen}
            setFile={setFile}
            selectedImage={selectedImage}
            imageAvatar={
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
            }
          />
          <ChangeImage
            open={open}
            setOpen={setOpen}
            file={file}
            setFile={setFile}
            selectedImage={selectedImage}
            handleImageUpload={handleImageUpload}
            isSuccess={isSuccess}
            isLoading={isLoading}
          />

          <Box component="div" textAlign="center">
            <Typography variant="body1" component="h1" fontWeight="bold">
              {user?.type}
            </Typography>
            <Typography>
              {user?.profile?.first_name
                ? `${user?.profile?.first_name} ${user?.profile?.last_name}`
                : user?.username}
            </Typography>
          </Box>
        </Stack>

        <Divider
          orientation="vertical"
          flexItem
          sx={{
            borderRightWidth: 2,
            display: {
              xs: "none",
              sm: isDrawerOpen ? "none" : "block",
              md: "block",
            },
          }}
        />

        <Stack spacing={1}>
          <Divider flexItem textAlign="left">
            Your Information
          </Divider>

          <ViewProfileForm />

          <Divider flexItem textAlign="left">
            Change Password
          </Divider>

          <ChangePasswordForm />

          <Divider flexItem textAlign="left">
            Change Username
          </Divider>

          <ChangeUsernameForm />

          <Divider flexItem textAlign="left">
            Change Email Address
          </Divider>

          <ChangeEmailForm />
        </Stack>
      </Stack>
    </Box>
  );
}

export default ViewProfile;
