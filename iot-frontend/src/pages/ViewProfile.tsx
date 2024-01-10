import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import useAuthStore from "../store/authStore";
import useDrawerStore from "../store/drawerStore";

import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import EditIcon from "@mui/icons-material/Edit";
import ImageAvatar from "../components/ImageAvatar";
import ViewProfileForm from "../components/user/ViewProfileForm";
import ChangePasswordForm from "../components/user/ChangePasswordForm";
import ChangeUsernameForm from "../components/user/ChangeUsernameForm";
import ChangeEmailForm from "../components/user/ChangeEmailForm";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import { ChangeEvent, useState, useRef } from "react";
import ChangeProfileImage from "../components/user/ChangeProfileImage";
import VisuallyHiddenInput from "../components/styledComponents/VisuallyHiddenInput";

function ViewProfile() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<string>("");
  const user = useAuthStore((state) => state.user);
  const isDrawerOpen = useDrawerStore((state) => state.isDrawerOpen);
  const selectedImage = useRef<HTMLInputElement | null>(null);

  const handleChangeImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files;
    if (file) {
      setFile(URL.createObjectURL(file[0]));
      setOpen(true);
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
            <ImageAvatar
              imgUrl={user?.profile?.profile_picture}
              altText={`${user?.profile?.first_name} ${user?.profile?.last_name}`}
              height={200}
              width={200}
            />
          </Badge>
          <ChangeProfileImage
            open={open}
            setOpen={setOpen}
            file={file}
            setFile={setFile}
            selectedImage={selectedImage}
          />

          <Box component="div" textAlign="center">
            <Typography variant="body1" component="h1" fontWeight="bold">
              {user?.type}
            </Typography>
            <Typography>
              {user?.profile?.first_name} {user?.profile?.last_name}
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
