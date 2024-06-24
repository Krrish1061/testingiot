import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import styled from "@mui/material/styles/styled";
import { Link as RouterLink } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import useCompanyStore from "../../store/companyStore";
import useDealerStore from "../../store/dealerStore";
import useDrawerStore from "../../store/drawerStore";
import ImageAvatar from "../ImageAvatar";
import Logo from "/logo.png";

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
  const isUserDealer = useAuthStore((state) => state.isUserDealer);
  const dealer = useDealerStore((state) => state.dealer);
  const isUserCompanySuperAdmin = useAuthStore(
    (state) => state.isUserCompanySuperAdmin
  );
  const company = useCompanyStore((state) => state.company);
  const avatarSize = isDrawerOpen ? 100 : 50;

  const handleIconButtonClick = () => {
    if (isMobile) setDrawerOpen(false);
  };

  const header = () => {
    if (isUserDealer && dealer) {
      return (
        <Stack
          justifyContent="center"
          alignItems="center"
          spacing={1}
          marginTop={1}
        >
          <ImageAvatar
            imgUrl={dealer.profile?.logo}
            altText={dealer.name}
            width={avatarSize}
            height={avatarSize}
          />

          {isDrawerOpen && (
            <Box textAlign="center">
              <Typography gutterBottom>{dealer.name}</Typography>
            </Box>
          )}
        </Stack>
      );
    } else if (isUserCompanySuperAdmin && company) {
      return (
        <Stack
          justifyContent="center"
          alignItems="center"
          spacing={1}
          marginTop={1}
        >
          <ImageAvatar
            imgUrl={company.profile?.logo}
            altText={company.name}
            width={avatarSize}
            height={avatarSize}
          />

          {isDrawerOpen && (
            <Box textAlign="center">
              <Typography gutterBottom>{company.name}</Typography>
            </Box>
          )}
        </Stack>
      );
    } else {
      return (
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
      );
    }
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

        {header()}
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
