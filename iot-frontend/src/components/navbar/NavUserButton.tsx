import BorderColorIcon from "@mui/icons-material/BorderColor";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Divider from "@mui/material/Divider";
import Grow from "@mui/material/Grow";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import Typography from "@mui/material/Typography";
import { useRef, useState } from "react";
import ProfileCard from "./ProfileCard";
import useLogout from "../../hooks/useLogout";
import CircularProgress from "@mui/material/CircularProgress";
import useAuthStore from "../../store/authStore";
import ImageAvatar from "../ImageAvatar";

// import styled from "@mui/material/styles/styled";
// const NavButton = styled(Button)(({ theme }) => ({
//   borderColor: theme.palette.common.white,
//   color: theme.palette.primary.contrastText,
//   "&:hover": {
//     backgroundColor: theme.palette.primary.dark,
//     borderColor: theme.palette.common.white,
//   },
// }));

function NavUserButton() {
  const [open, setOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const { mutate, isLoading } = useLogout();

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

  const handleLogout = () => {
    mutate();
  };

  function handleListKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Tab") {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <>
      <Button
        ref={anchorRef}
        id="composition-button"
        aria-controls={open ? "composition-menu" : undefined}
        aria-expanded={open ? "true" : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
        disableElevation
        variant="outlined"
      >
        <ImageAvatar
          imgUrl={user?.profile?.profile_picture}
          altText={`${user?.profile?.first_name} ${user?.profile?.last_name}`}
          height={30}
          width={30}
        />
        {/* // marginRight: 2, */}
        {/* display typography component only on larger screen sizes */}
        <Typography
          component="h1"
          variant="h6"
          fontSize={16}
          noWrap
          marginLeft={2}
          textAlign="center"
        >
          {/* first name only truncate the name if exceeds */}
          {user?.profile?.first_name}
        </Typography>
      </Button>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        placement="bottom-start"
        transition
        sx={{ zIndex: 1200 }}
      >
        {({ TransitionProps }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: "left top",
            }}
          >
            <Paper sx={{ marginTop: 1 }}>
              <ClickAwayListener onClickAway={handleClose}>
                <Box>
                  <MenuList
                    id="composition-menu"
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
                    <Divider
                      variant="middle"
                      sx={{ borderBottomWidth: "2px" }}
                    />
                    <MenuItem onClick={handleClose}>
                      <ListItemIcon>
                        <BorderColorIcon />
                      </ListItemIcon>
                      <ListItemText primary="Edit Profile" />
                    </MenuItem>
                    <MenuItem onClick={handleClose}>
                      <ListItemIcon>
                        <PersonOutlineIcon />
                      </ListItemIcon>
                      <ListItemText primary="View Profile" />
                    </MenuItem>
                    <MenuItem disabled={isLoading} onClick={handleLogout}>
                      <ListItemIcon>
                        <LogoutIcon />
                      </ListItemIcon>
                      <ListItemText primary="Logout" />
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
