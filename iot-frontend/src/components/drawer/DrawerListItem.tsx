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
import CompanyList from "../CompanyList";

const DrawerTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.white,
    color: "rgba(0, 0, 0, 0.87)",
    boxShadow: theme.shadows[1],
    fontSize: 10,
  },
  [`& .${tooltipClasses.arrow}`]: {
    // Customize the arrow styles here
    color: "black",
  },
}));

interface DrawerListItemProps {
  icon: ReactNode;
  children?: ReactNode;
  text: string;
  autoFocus?: boolean;
  isDropdown?: boolean;
  linkto?: string;
}

const DrawerListItem = ({
  icon,
  text,
  autoFocus = false,
  isDropdown = false,
  linkto,
}: DrawerListItemProps) => {
  const [dropdownState, setDropdownState] = useState(false);
  const isDrawerOpen = useDrawerStore((state) => state.isDrawerOpen);
  const handleClick = () => {
    setDropdownState(!dropdownState);
  };
  if (!isDropdown) {
    return (
      <ListItem disableGutters disablePadding>
        {linkto ? (
          <ListItemButton
            autoFocus={autoFocus}
            component={RouterLink}
            to={linkto}
          >
            <ListItemIcon sx={{ marginRight: -1 }}>{icon}</ListItemIcon>
            <ListItemText primary={text} />
          </ListItemButton>
        ) : (
          <ListItemButton autoFocus={autoFocus}>
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
                onClick={handleClick}
              >
                <ListItemIcon sx={{ marginRight: -1 }}>{icon}</ListItemIcon>
                <ListItemText primary={text} />
                {dropdownState ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>

            <Collapse in={dropdownState} unmountOnExit sx={{ paddingLeft: 5 }}>
              <CompanyList />
            </Collapse>
          </>
        ) : (
          <DrawerTooltip
            title={<CompanyList />}
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
