import Popper from "@mui/material/Popper";
import Box from "@mui/material/Box";
import Grow from "@mui/material/Grow";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Paper from "@mui/material/Paper";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import PersonIcon from "@mui/icons-material/Person";
import DevicesIcon from "@mui/icons-material/Devices";
import SensorsIcon from "@mui/icons-material/Sensors";
import ApartmentIcon from "@mui/icons-material/Apartment";
import {
  Dispatch,
  RefObject,
  SetStateAction,
  SyntheticEvent,
  useState,
} from "react";
import AddCompanyForm from "../company/AddCompanyForm";
import AddSensorForm from "../sensor/AddSensorForm";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  anchorRef: RefObject<HTMLButtonElement>;
  handleClickUserButton: () => void;
}

function AddPopper({ open, setOpen, anchorRef, handleClickUserButton }: Props) {
  const [companyForm, setCompanyForm] = useState(false);
  const [sensorForm, setSensorForm] = useState(false);

  function handleListKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Tab") {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  const handleClose = (event: Event | SyntheticEvent) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  const handleCompanyButton = (event: Event | SyntheticEvent) => {
    setCompanyForm(true);
    handleClose(event);
  };

  const handleSensorButton = (event: Event | SyntheticEvent) => {
    setSensorForm(true);
    handleClose(event);
  };

  return (
    <>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        placement="bottom-end"
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
                    id="add"
                    autoFocus={open}
                    aria-labelledby="composition-button"
                    onKeyDown={handleListKeyDown}
                    sx={{
                      "&:focus": {
                        outline: "none",
                      },
                    }}
                  >
                    <MenuItem onClick={handleClickUserButton}>
                      <ListItemIcon>
                        <PersonIcon />
                      </ListItemIcon>
                      User
                    </MenuItem>
                    <MenuItem onClick={handleCompanyButton}>
                      <ListItemIcon>
                        <ApartmentIcon />
                      </ListItemIcon>
                      Company
                    </MenuItem>
                    <MenuItem onClick={handleClose}>
                      <ListItemIcon>
                        <DevicesIcon />
                      </ListItemIcon>
                      Iot Device
                    </MenuItem>
                    <MenuItem onClick={handleSensorButton}>
                      <ListItemIcon>
                        <SensorsIcon />
                      </ListItemIcon>
                      Sensor
                    </MenuItem>
                  </MenuList>
                </Box>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
      <AddCompanyForm open={companyForm} setOpen={setCompanyForm} />
      <AddSensorForm open={sensorForm} setOpen={setSensorForm} />
    </>
  );
}

export default AddPopper;
