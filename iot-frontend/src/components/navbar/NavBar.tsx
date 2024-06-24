import AddIcon from "@mui/icons-material/Add";
import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import useDrawerStore from "../../store/drawerStore";
import ImageAvatar from "../ImageAvatar";
import AddUserForm from "../user/AddUserForm";
import AddPopper from "./AddPopper";
import NavUserButton from "./NavUserButton";
import SearchBar from "./SearchBar";
import StyledAppBar from "./StyledAppBar";
import StyledNavButton from "./StyledNavButton";
import Logo from "/logo.png";

function NavBar() {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const isDrawerOpen = useDrawerStore((state) => state.isDrawerOpen);
  const toggleDrawerOpen = useDrawerStore((state) => state.toggleDrawerOpen);
  const [openUserForm, setOpenUserForm] = useState(false);
  const [openAddPopper, setOpenAddPopper] = useState(false);
  const isUserSuperAdmin = useAuthStore((state) => state.isUserSuperAdmin);
  const isUserAdmin = useAuthStore((state) => state.isUserAdmin);
  const isUserCompanySuperAdmin = useAuthStore(
    (state) => state.isUserCompanySuperAdmin
  );
  const isUserDealer = useAuthStore((state) => state.isUserDealer);
  const isDrawerDisplayed = isUserSuperAdmin || isUserAdmin;

  const handleDrawerOpen = () => {
    toggleDrawerOpen();
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
      <StyledAppBar
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
              <IconButton component={RouterLink} to="/" disableRipple>
                <ImageAvatar
                  altText="Thoplo Machine Logo"
                  variant="square"
                  imgUrl={Logo}
                  width={50}
                  height={50}
                />
              </IconButton>
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
            {(isUserSuperAdmin || isUserDealer) && (
              <>
                <StyledNavButton
                  variant="outlined"
                  disableElevation
                  startIcon={<AddIcon fontSize="large" />}
                  ref={anchorRef}
                  onClick={handleClickAddButton}
                >
                  Add
                </StyledNavButton>
                <AddPopper
                  open={openAddPopper}
                  setOpen={setOpenAddPopper}
                  anchorRef={anchorRef}
                  isUserSuperAdmin={isUserSuperAdmin}
                  handleClickUserButton={handleClickUserButton}
                />
              </>
            )}

            {isUserAdmin && !isUserDealer && (
              <StyledNavButton
                variant="outlined"
                disableElevation
                startIcon={<AddIcon fontSize="large" />}
                onClick={handleClickUserButton}
              >
                User
              </StyledNavButton>
            )}

            <NavUserButton />
          </Stack>
        </Toolbar>
      </StyledAppBar>
      {(isUserSuperAdmin || isUserAdmin) && (
        <AddUserForm
          open={openUserForm}
          setOpen={setOpenUserForm}
          isUserSuperAdmin={isUserSuperAdmin}
          isUserDealer={isUserDealer}
          isUserCompanySuperAdmin={isUserCompanySuperAdmin}
        />
      )}
    </>
  );
}

export default NavBar;
