import AddIcon from "@mui/icons-material/Add";
import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import NavUserButton from "./NavUserButton";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import styled from "@mui/material/styles/styled";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import useDrawerStore from "../../store/drawerStore";
// import AppBar from "@mui/material/AppBar";

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer,
  color: "inherit",
  backgroundColor: "white",
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    [theme.breakpoints.up("sm")]: {
      width: `calc(100% - ${drawerWidth}px)`,
    },

    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
  ...(!open && {
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
  const isDrawerOpen = useDrawerStore((state) => state.isDrawerOpen);
  const setIsDrawerOpen = useDrawerStore((state) => state.setIsDrawerOpen);

  const handleDrawerOpen = () => {
    setIsDrawerOpen();
  };

  return (
    <AppBar position="fixed" component="nav" open={isDrawerOpen}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={handleDrawerOpen}
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
          {/* need to decreases size on mobile devices */}
          <Button
            variant="outlined"
            disableElevation
            startIcon={<AddIcon fontSize="large" />}
          >
            <Typography>Company</Typography>
          </Button>
          <Button
            variant="outlined"
            disableElevation
            startIcon={<AddIcon fontSize="large" />}
          >
            <Typography>User</Typography>
          </Button>
          <NavUserButton />
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

export default NavBar;
