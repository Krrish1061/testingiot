import AddIcon from "@mui/icons-material/Add";
import MenuIcon from "@mui/icons-material/Menu";
import AppBar from "@mui/material/AppBar";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import NavButton from "./NavButton";
import { styled } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import Face2Icon from "@mui/icons-material/Face2";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const UserButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.dark,
  borderColor: theme.palette.common.white,
  color: theme.palette.primary.contrastText,
  "&:hover": {
    backgroundColor: theme.palette.common.white,
    borderColor: theme.palette.primary.dark,
    color: theme.palette.common.black,
  },
}));

function NavBar() {
  return (
    <AppBar position="fixed">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{
            marginRight: 5,
          }}
        >
          <MenuIcon />
        </IconButton>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="center"
        >
          <NavButton icon={<AddIcon />} label="Company" />
          <NavButton icon={<AddIcon />} label="User" />
          {/* <UserButton /> */}
          <Box>
            <UserButton disableElevation variant="outlined">
              <Avatar
                sx={{
                  marginRight: 2,
                  height: 30,
                  width: 30,
                }}
              >
                <Face2Icon color="info" sx={{ height: 25, width: 25 }} />
              </Avatar>
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
            </UserButton>
          </Box>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

export default NavBar;
