import MuiDrawer from "@mui/material/Drawer";
import useDrawerStore from "../../store/drawerStore";
import styled from "@mui/material/styles/styled";
import { CSSObject, Theme } from "@mui/material";
import DrawerHeader from "./DrawerHeader";
import DrawerList from "./DrawerList";
const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  [theme.breakpoints.down("sm")]: {
    display: "none",
  },
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
  "&::-webkit-scrollbar": {
    display: "none",
  },
  scrollbarWidth: "none", // Hide the scrollbar for Firefox
  msOverflowStyle: "none", // Hide the scrollbar for IE and Edge
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",

  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
  [theme.breakpoints.down("sm")]: {
    display: "none",
  },
  "&::-webkit-scrollbar": {
    display: "none",
  },
  scrollbarWidth: "none", // Hide the scrollbar for Firefox
  msOverflowStyle: "none", // Hide the scrollbar for IE and Edge
});

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  backgroundColor: theme.palette.primary.main,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",

  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

function DesktopDrawer() {
  const isDrawerOpen = useDrawerStore((state) => state.isDrawerOpen);
  return (
    <Drawer variant="permanent" open={isDrawerOpen}>
      <DrawerHeader />
      <DrawerList />
    </Drawer>
  );
}

export default DesktopDrawer;
