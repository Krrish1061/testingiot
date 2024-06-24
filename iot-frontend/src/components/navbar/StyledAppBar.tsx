import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import styled from "@mui/material/styles/styled";

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
  isDrawerDisplayed: boolean;
}

const drawerWidth = 240;

const StyledAppBar = styled(MuiAppBar, {
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
      // if you change any value here change in sidebar also
      [theme.breakpoints.up("sm")]: {
        width: `calc(100% - ${theme.spacing(8)} + 1px)`,
      },
    }),
}));

export default StyledAppBar;
