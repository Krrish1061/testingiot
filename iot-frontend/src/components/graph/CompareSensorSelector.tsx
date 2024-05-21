import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Box from "@mui/material/Box";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  Dispatch,
  RefObject,
  SetStateAction,
  SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import IotDevice from "../../entities/IotDevice";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  anchorRef: RefObject<HTMLButtonElement>;
  iotDevices: IotDevice[];
  deviceSensorList: string[];
  selectedSensor: string;
  selectedDevice: number;
  setCompareTo: Dispatch<
    SetStateAction<{
      deviceId: number;
      sensor: string;
    } | null>
  >;
}

function CompareSensorSelector({
  open,
  setOpen,
  anchorRef,
  iotDevices,
  setCompareTo,
  deviceSensorList,
  selectedSensor,
  selectedDevice,
}: Props) {
  const [deviceId, setDeviceId] = useState<null | number>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const handleClose = (event: Event | SyntheticEvent) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = useRef(open);
  const isSensorSelected = selectedIndex === -1;
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current!.focus();
    }

    prevOpen.current = open;

    if (open && isSensorSelected && iotDevices.length > 1) setDeviceId(null);
  }, [anchorRef, open, isSensorSelected, iotDevices]);

  useEffect(() => {
    if (iotDevices.length === 1) setDeviceId(iotDevices[0].id);
  }, [iotDevices]);

  return (
    <Popper
      open={open}
      anchorEl={anchorRef.current}
      role={undefined}
      placement="left-start"
      transition
      disablePortal
    >
      {({ TransitionProps }) => (
        <Grow
          {...TransitionProps}
          style={{
            transformOrigin: "right top",
          }}
        >
          <Paper>
            <ClickAwayListener onClickAway={handleClose}>
              <Box>
                <Stack
                  direction="row"
                  justifyContent={deviceId ? "space-among" : "center"}
                  alignItems="center"
                  paddingTop={1}
                  paddingX={1}
                >
                  {deviceId && iotDevices.length > 1 && (
                    <IconButton
                      size="small"
                      onClick={() => {
                        setDeviceId(null);
                        setSelectedIndex(-1);
                      }}
                    >
                      <ArrowBackIcon fontSize="small" />
                    </IconButton>
                  )}
                  <Typography textAlign="center">
                    {deviceId ? "Select Sensor" : "Select Iot Devices"}
                  </Typography>
                </Stack>
                <List dense disablePadding>
                  {!deviceId
                    ? iotDevices.map((iotDevice, index) => (
                        <ListItemButton
                          key={index}
                          onClick={() => {
                            setDeviceId(iotDevice.id);
                          }}
                        >
                          <ListItemText
                            primary={
                              iotDevice.iot_device_details.name || iotDevice.id
                            }
                          />
                        </ListItemButton>
                      ))
                    : deviceSensorList.map((sensor, index) => (
                        <ListItemButton
                          selected={selectedIndex === index}
                          key={index}
                          disabled={
                            selectedDevice === deviceId &&
                            selectedSensor === sensor
                          }
                          onClick={() => {
                            setOpen(false);
                            setSelectedIndex(index);
                            setCompareTo({
                              deviceId: deviceId,
                              sensor: sensor,
                            });
                          }}
                        >
                          <ListItemText primary={sensor} />
                        </ListItemButton>
                      ))}
                </List>
              </Box>
            </ClickAwayListener>
          </Paper>
        </Grow>
      )}
    </Popper>
  );
}

export default CompareSensorSelector;
