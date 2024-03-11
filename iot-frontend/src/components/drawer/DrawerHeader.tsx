import Box from "@mui/material/Box";
import useDrawerStore from "../../store/drawerStore";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import useAuthStore from "../../store/authStore";
import Logo from "/logo.png";
import styled from "@mui/material/styles/styled";
import Divider from "@mui/material/Divider";
import ImageAvatar from "../ImageAvatar";

export const SideBarHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-around",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const DrawerHeader = () => {
  const isDrawerOpen = useDrawerStore((state) => state.isDrawerOpen);
  const user = useAuthStore((state) => state.user);
  const avatarSize = isDrawerOpen ? 100 : 50;

  return (
    <>
      <Box>
        <SideBarHeader>
          <ImageAvatar
            altText="Thoplo Machine Logo"
            imgUrl={Logo}
            width={50}
            height={50}
          />
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
                : user!.username
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
