import Box from "@mui/material/Box";
import useDrawerStore from "../../store/drawerStore";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import useAuthStore from "../../store/authStore";
import Logo from "/logo.png";
import styled from "@mui/material/styles/styled";
import Divider from "@mui/material/Divider";
import ImageAvatar from "../ImageAvatar";
import { Link as RouterLink } from "react-router-dom";
import IconButton from "@mui/material/IconButton";

export const SideBarHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const DrawerHeader = () => {
  const isDrawerOpen = useDrawerStore((state) => state.isDrawerOpen);
  const isMobile = useDrawerStore((state) => state.isMobile);
  const setDrawerOpen = useDrawerStore((state) => state.setDrawerOpen);
  const user = useAuthStore((state) => state.user);
  const avatarSize = isDrawerOpen ? 100 : 50;

  const handleIconButtonClick = () => {
    if (isMobile) setDrawerOpen(false);
  };

  return (
    <>
      <Box>
        <SideBarHeader>
          <IconButton
            component={RouterLink}
            to="/"
            disableRipple
            onClick={handleIconButtonClick}
          >
            <ImageAvatar
              altText="Thoplo Machine Logo"
              variant="square"
              imgUrl={Logo}
              width={50}
              height={50}
            />
          </IconButton>
          {isDrawerOpen ? (
            <Typography noWrap variant="h6" component="h1">
              Thoplo Machine
            </Typography>
          ) : null}
        </SideBarHeader>

        <Stack
          justifyContent="center"
          alignItems="center"
          spacing={1}
          marginTop={1}
        >
          <ImageAvatar
            imgUrl={user?.profile?.profile_picture}
            altText={
              user?.profile?.first_name
                ? `${user?.profile?.first_name} ${user?.profile?.last_name}`
                : user?.username
            }
            width={avatarSize}
            height={avatarSize}
          />

          {isDrawerOpen && (
            <Box textAlign="center">
              <Typography>{user?.username}</Typography>
              <Typography gutterBottom>{user?.type}</Typography>
            </Box>
          )}
        </Stack>
      </Box>
      <Divider
        sx={{
          marginTop: isDrawerOpen ? 0 : 2.5,
        }}
      />
    </>
  );
};

export default DrawerHeader;
