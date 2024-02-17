import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { ReactNode, useState } from "react";
import { styled } from "@mui/material/styles";
import Collapse from "@mui/material/Collapse";
import Tooltip, { TooltipProps, tooltipClasses } from "@mui/material/Tooltip";
import Zoom from "@mui/material/Zoom";
import { Link as RouterLink } from "react-router-dom";
import useDrawerStore from "../../store/drawerStore";
import Box from "@mui/material/Box";

const DrawerTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    boxShadow: theme.shadows[1],
    fontSize: 10,
  },
  [`& .${tooltipClasses.arrow}`]: {
    // Customize the arrow styles here
    color: theme.palette.text.primary,
  },
}));

interface DrawerListItemProps {
  icon: ReactNode;
  children?: ReactNode;
  text: string;
  autoFocus?: boolean;
  isDropdown?: boolean;
  linkto?: string;
  dropDownNode?: ReactNode;
}

const DrawerListItem = ({
  icon,
  text,
  autoFocus = false,
  isDropdown = false,
  linkto,
  dropDownNode,
}: DrawerListItemProps) => {
  const [dropdownState, setDropdownState] = useState(false);
  const isDrawerOpen = useDrawerStore((state) => state.isDrawerOpen);
  const setDrawerOpen = useDrawerStore((state) => state.setDrawerOpen);
  const isMobile = useDrawerStore((state) => state.isMobile);

  const handleDropDownButtonClick = () => {
    setDropdownState(!dropdownState);
  };

  const handleListButtonClick = () => {
    if (isMobile) setDrawerOpen(false);
  };

  if (!isDropdown) {
    return (
      <ListItem disableGutters disablePadding>
        {linkto && (
          <ListItemButton
            autoFocus={autoFocus}
            component={RouterLink}
            to={linkto}
            onClick={handleListButtonClick}
          >
            <ListItemIcon sx={{ marginRight: -1 }}>{icon}</ListItemIcon>
            <ListItemText primary={text} />
          </ListItemButton>
        )}
      </ListItem>
    );
  } else {
    return (
      <>
        {isDrawerOpen ? (
          <>
            <ListItem disableGutters disablePadding>
              <ListItemButton
                sx={{ paddingRight: 0.5 }}
                autoFocus={autoFocus}
                onClick={handleDropDownButtonClick}
              >
                <ListItemIcon sx={{ marginRight: -1 }}>{icon}</ListItemIcon>
                <ListItemText primary={text} />
                {dropdownState ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>

            <Collapse in={dropdownState} unmountOnExit sx={{ paddingLeft: 5 }}>
              <Box
                role="presentation"
                onClick={handleListButtonClick}
                onKeyDown={handleListButtonClick}
              >
                {dropDownNode}
              </Box>
            </Collapse>
          </>
        ) : (
          <DrawerTooltip
            title={dropDownNode}
            arrow
            placement="right"
            TransitionComponent={Zoom}
          >
            <ListItem disableGutters disablePadding>
              <ListItemButton autoFocus={autoFocus}>
                <ListItemIcon
                  sx={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {icon}
                  <FiberManualRecordIcon sx={{ marginLeft: 1, fontSize: 10 }} />
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          </DrawerTooltip>
        )}
      </>
    );
  }
};

export default DrawerListItem;
