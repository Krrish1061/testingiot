import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import Box from "@mui/material/Box";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Collapse from "@mui/material/Collapse";
import Grow from "@mui/material/Grow";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import { ReactNode, SyntheticEvent, useEffect, useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import useDrawerStore from "../../store/drawerStore";
import arrowStyles from "../styledComponents/ArrowStyles";
import PopperWithArrow from "../styledComponents/PopperWithArrow";

interface DrawerListItemProps {
  icon: ReactNode;
  text: string;
  isDropdown?: boolean;
  linkto?: string;
  dropDownNode?: ReactNode;
}

const DrawerListItem = ({
  icon,
  text,
  isDropdown = false,
  linkto,
  dropDownNode,
}: DrawerListItemProps) => {
  const [dropdownState, setDropdownState] = useState(false);
  const isDrawerOpen = useDrawerStore((state) => state.isDrawerOpen);
  const setDrawerOpen = useDrawerStore((state) => state.setDrawerOpen);
  const isMobile = useDrawerStore((state) => state.isMobile);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [arrowRef, setArrowRef] = useState(null);

  const handleClose = (event: Event | SyntheticEvent) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }
    setOpen(false);
  };

  const handleDropDownButtonClick = () => {
    setDropdownState(!dropdownState);
  };

  const handleListButtonClick = () => {
    if (isMobile) setDrawerOpen(false);
  };

  useEffect(() => {
    if (isDrawerOpen) {
      setOpen(false);
    }
  }, [isDrawerOpen]);

  if (!isDropdown) {
    return (
      <ListItem disableGutters disablePadding>
        {linkto && (
          <ListItemButton
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
    if (isDrawerOpen) {
      return (
        <>
          <ListItem disableGutters disablePadding>
            <ListItemButton
              sx={{ paddingRight: 0.5 }}
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
      );
    } else {
      return (
        <>
          <ListItem disableGutters disablePadding>
            <ListItemButton onClick={() => setOpen(!open)}>
              <ListItemIcon
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}
                ref={anchorRef}
              >
                {icon}
                <FiberManualRecordIcon sx={{ marginLeft: 1, fontSize: 10 }} />
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
          <PopperWithArrow
            open={open}
            anchorEl={anchorRef.current}
            role={undefined}
            placement="right"
            transition
            sx={{ zIndex: 1300 }}
            modifiers={[
              {
                name: "arrow",
                enabled: true,
                options: {
                  element: arrowRef,
                },
              },
            ]}
          >
            {({ TransitionProps }) => (
              <Grow
                {...TransitionProps}
                style={{
                  transformOrigin: "right top",
                }}
              >
                <Paper
                  elevation={12}
                  sx={{ width: 250, paddingLeft: isDrawerOpen ? 0 : 1 }}
                >
                  <ClickAwayListener onClickAway={handleClose}>
                    <Box role="presentation" onClick={handleClose}>
                      {dropDownNode}
                      <Box
                        component="span"
                        className="arrow"
                        ref={setArrowRef}
                        sx={arrowStyles}
                      />
                    </Box>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </PopperWithArrow>
        </>
      );
    }
  }
};

export default DrawerListItem;
