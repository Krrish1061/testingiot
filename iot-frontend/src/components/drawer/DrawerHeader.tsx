import Box from "@mui/material/Box";
import useDrawerStore from "../../store/drawerStore";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import useAuthStore from "../../store/authStore";
import Face2Icon from "@mui/icons-material/Face2";
import Logo from "/logo.png";
import styled from "@mui/material/styles/styled";
import Divider from "@mui/material/Divider";

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
  const iconFontSize = isDrawerOpen ? 80 : 40;

  return (
    <>
      <Box>
        <SideBarHeader>
          <Avatar
            alt="Thoplo Machine Logo"
            variant="rounded"
            src={Logo}
            sx={{ width: 50, height: 50 }}
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
          <Avatar
            sx={{
              width: avatarSize,
              height: avatarSize,
            }}
          >
            <Face2Icon color="primary" sx={{ fontSize: iconFontSize }} />
          </Avatar>
          {isDrawerOpen && (
            <Box textAlign="center">
              <Typography>{user?.username}</Typography>
              <Typography gutterBottom> {user?.type}</Typography>
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
