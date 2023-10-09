import BorderColorIcon from "@mui/icons-material/BorderColor";
import Face2Icon from "@mui/icons-material/Face2";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import Avatar from "@mui/material/Avatar";
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
  const anchorRef = useRef<HTMLButtonElement>(null);

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
        <Avatar
          sx={{
            marginRight: 2,
            height: 30,
            width: 30,
          }}
        >
          <Face2Icon color="info" sx={{ height: 25, width: 25 }} />
        </Avatar>
        {/* display typography component only on larger screen sizes */}
        <Typography
          component="h1"
          variant="h6"
          //   color="white"
          fontSize={16}
          noWrap
          textAlign="center"
        >
          {/* first name only truncate the name if exceeds */}
          Krishna
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
                    <MenuItem onClick={handleClose}>
                      <ListItemIcon>
                        <LogoutIcon />
                      </ListItemIcon>
                      <ListItemText primary="Logout" />
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
