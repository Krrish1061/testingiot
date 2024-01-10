import AddIcon from "@mui/icons-material/Add";
import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import NavUserButton from "./NavUserButton";
import styled from "@mui/material/styles/styled";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import useDrawerStore from "../../store/drawerStore";
import { useRef, useState } from "react";
import AddUserForm from "../user/AddUserForm";
import useAuthStore from "../../store/authStore";
import NavButton from "./NavButton";
import SearchBar from "./SearchBar";
import AddPopper from "./AddPopper";
import ImageAvatar from "../ImageAvatar";
import Logo from "/logo.png";
import Typography from "@mui/material/Typography";
import UserGroups from "../../constants/userGroups";

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
  isDrawerDisplayed: boolean;
}

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open" && prop !== "isDrawerDisplayed",
})<AppBarProps>(({ theme, open, isDrawerDisplayed }) => ({
  zIndex: theme.zIndex.drawer,
  backgroundColor: theme.palette.background.default,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open &&
    isDrawerDisplayed && {
      marginLeft: drawerWidth,
      [theme.breakpoints.up("sm")]: {
        width: `calc(100% - ${drawerWidth}px)`,
      },

      transition: theme.transitions.create(["width", "margin"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  ...(!open &&
    isDrawerDisplayed && {
      transition: theme.transitions.create(["width", "margin"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      overflowX: "hidden",
      // if you change any value change in sidebar also
      [theme.breakpoints.up("sm")]: {
        width: `calc(100% - ${theme.spacing(8)} + 1px)`,
      },
    }),
}));

function NavBar() {
  const user = useAuthStore((state) => state.user);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const isDrawerOpen = useDrawerStore((state) => state.isDrawerOpen);
  const setIsDrawerOpen = useDrawerStore((state) => state.setIsDrawerOpen);
  const [openUserForm, setOpenUserForm] = useState(false);
  const [openAddPopper, setOpenAddPopper] = useState(false);
  const isUserSuperAdmin =
    user?.groups.includes(UserGroups.superAdminGroup) || false;
  const isUserAdmin = user?.groups.includes(UserGroups.adminGroup) || false;
  const isUserCompanySuperAdmin =
    user?.groups.includes(UserGroups.companySuperAdminGroup) || false;
  const isDrawerDisplayed = isUserSuperAdmin || isUserAdmin;

  const handleDrawerOpen = () => {
    setIsDrawerOpen();
  };

  const handleClickUserButton = () => {
    setOpenUserForm(!openUserForm);
    // closing add popper for superadmin
    if (isUserSuperAdmin) setOpenAddPopper(!openAddPopper);
  };

  const handleClickAddButton = () => {
    setOpenAddPopper(!openAddPopper);
  };

  return (
    <>
      <AppBar
        position="fixed"
        component="nav"
        open={isDrawerOpen}
        isDrawerDisplayed={isDrawerDisplayed}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          {!isDrawerDisplayed && (
            <Stack
              direction="row"
              justifyContent="center"
              alignItems="center"
              spacing={2}
            >
              <ImageAvatar
                altText="Thoplo Machine Logo"
                variant="square"
                imgUrl={Logo}
                width={50}
                height={50}
              />
              <Typography
                component="h1"
                variant="h6"
                sx={{ display: { xs: "none", sm: "inherit" } }}
              >
                Thoplo Machine
              </Typography>
            </Stack>
          )}
          <Stack
            direction="row"
            spacing={{ xs: 2, sm: isDrawerOpen ? 0 : 2, md: 2 }}
          >
            {/* for admin and superadmin */}
            {isDrawerDisplayed && (
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={handleDrawerOpen}
              >
                <MenuIcon />
              </IconButton>
            )}
            {isUserSuperAdmin && <SearchBar />}
          </Stack>
          <Stack
            direction="row"
            spacing={{ xs: 1, md: 2 }}
            alignItems="center"
            justifyContent="center"
          >
            {isUserSuperAdmin && (
              <>
                <NavButton
                  variant="outlined"
                  disableElevation
                  startIcon={<AddIcon fontSize="large" />}
                  ref={anchorRef}
                  onClick={handleClickAddButton}
                >
                  Add
                </NavButton>
                <AddPopper
                  open={openAddPopper}
                  setOpen={setOpenAddPopper}
                  anchorRef={anchorRef}
                  handleClickUserButton={handleClickUserButton}
                />
              </>
            )}

            {isUserAdmin && (
              <NavButton
                variant="outlined"
                disableElevation
                startIcon={<AddIcon fontSize="large" />}
                onClick={handleClickUserButton}
              >
                User
              </NavButton>
            )}

            <NavUserButton />
          </Stack>
        </Toolbar>
      </AppBar>
      {(isUserSuperAdmin || isUserAdmin) && (
        <AddUserForm
          open={openUserForm}
          setOpen={setOpenUserForm}
          isUserSuperAdmin={isUserSuperAdmin}
          isUserCompanySuperAdmin={isUserCompanySuperAdmin}
        />
      )}
    </>
  );
}

export default NavBar;
