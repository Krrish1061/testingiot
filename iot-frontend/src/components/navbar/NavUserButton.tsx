import ImageAvatar from "../ImageAvatar";
import useAuthStore from "../../store/authStore";
import MenuItem from "@mui/material/MenuItem";
import ProfileCard from "./ProfileCard";
import Divider from "@mui/material/Divider";
import { useTheme } from "@mui/material/styles";
import { useState, useRef, useContext } from "react";
import Typography from "@mui/material/Typography";
import NavButton from "./NavButton";
import Popper from "@mui/material/Popper";
import Box from "@mui/material/Box";
import Grow from "@mui/material/Grow";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Paper from "@mui/material/Paper";
import MenuList from "@mui/material/MenuList";
import ListItemIcon from "@mui/material/ListItemIcon";
import Logout from "@mui/icons-material/Logout";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { useNavigate } from "react-router-dom";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { ColorModeContext } from "../../theme";
import useLogout from "../../hooks/auth/useLogout";
import CircularProgress from "@mui/material/CircularProgress";

function NavUserButton() {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate();
  const anchorRef = useRef<HTMLButtonElement>(null);
  const user = useAuthStore((state) => state.user);
  const [open, setOpen] = useState(false);
  const { mutateAsync, isLoading } = useLogout();

  function handleListKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Tab") {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event | React.SyntheticEvent) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  const handleViewProfile = (event: Event | React.SyntheticEvent) => {
    handleClose(event);
    navigate("/profile");
  };

  const handleColorModeToggle = (event: Event | React.SyntheticEvent) => {
    colorMode.toggleColorMode();
    handleClose(event);
  };

  const handleLogout = async () => {
    await mutateAsync();
  };

  return (
    <>
      <NavButton
        variant="outlined"
        disableElevation
        isAvatar={true}
        ref={anchorRef}
        onClick={handleToggle}
        aria-controls={open ? "menu" : undefined}
        aria-expanded={open ? "true" : undefined}
        aria-haspopup="true"
      >
        <ImageAvatar
          imgUrl={user?.profile?.profile_picture}
          altText={
            user?.profile?.first_name
              ? `${user?.profile?.first_name} ${user?.profile?.last_name}`
              : user!.username
          }
          height={{
            xs: 50,
            md: 30,
          }}
          width={{
            xs: 50,
            md: 30,
          }}
        />
        <Typography
          display={{
            xs: "none",
            md: "inherit",
          }}
        >
          {user?.profile?.first_name || user?.username}
        </Typography>
      </NavButton>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        placement="bottom-start"
        transition
        sx={{ zIndex: 1300 }}
      >
        {({ TransitionProps }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: "right top",
            }}
          >
            <Paper elevation={12}>
              <ClickAwayListener onClickAway={handleClose}>
                <Box>
                  <MenuList
                    id="menu"
                    autoFocus={open}
                    aria-labelledby="composition-button"
                    onKeyDown={handleListKeyDown}
                    subheader={<ProfileCard />}
                    sx={{
                      "&:focus": {
                        outline: "none",
                      },
                    }}
                  >
                    <Divider sx={{ borderBottomWidth: "2px" }} />

                    <MenuItem onClick={handleColorModeToggle}>
                      <ListItemIcon>
                        {theme.palette.mode === "dark" ? (
                          <Brightness7Icon fontSize="small" />
                        ) : (
                          <Brightness4Icon fontSize="small" />
                        )}
                      </ListItemIcon>
                      {theme.palette.mode.charAt(0).toUpperCase() +
                        theme.palette.mode.substring(1)}{" "}
                      Mode
                    </MenuItem>
                    <MenuItem onClick={handleViewProfile}>
                      <ListItemIcon>
                        <PersonOutlineIcon />
                      </ListItemIcon>
                      View Profile
                    </MenuItem>
                    <MenuItem disabled={isLoading} onClick={handleLogout}>
                      <ListItemIcon>
                        <Logout />
                      </ListItemIcon>
                      Logout
                      {isLoading && (
                        <CircularProgress
                          color="primary"
                          size={30}
                          thickness={5}
                          sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            marginTop: "-12px",
                            marginLeft: "-12px",
                          }}
                        />
                      )}
                    </MenuItem>
                  </MenuList>
                </Box>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}

export default NavUserButton;
