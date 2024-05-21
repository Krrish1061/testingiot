import CloseIcon from "@mui/icons-material/Close";
import CompareIcon from "@mui/icons-material/Compare";
import DownloadIcon from "@mui/icons-material/Download";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import { RefObject } from "react";
import IotDevice from "../../entities/IotDevice";
import useDrawerStore from "../../store/drawerStore";

interface Props {
  device: number;
  iotDevices: IotDevice[];
  sensor: string;
  isLoading: boolean;
  sensorList: string[] | undefined;
  anchorRef: RefObject<HTMLButtonElement>;
  handleDeviceChange: (event: SelectChangeEvent) => void;
  handleSensorChange: (event: SelectChangeEvent) => void;
  handleDownloadClick: () => void;
  handleCompareClick: () => void;
  handleCompareClearClick: () => void;
  compareTo: {
    deviceId: number;
    sensor: string;
  } | null;
}

function DeviceSensorSelector({
  device,
  iotDevices,
  sensor,
  sensorList,
  isLoading,
  anchorRef,
  compareTo,
  handleDeviceChange,
  handleSensorChange,
  handleDownloadClick,
  handleCompareClick,
  handleCompareClearClick,
}: Props) {
  const isDrawerOpen = useDrawerStore((state) => state.isDrawerOpen);
  return (
    <Stack
      direction={{
        xs: "column",
        sm: isDrawerOpen ? "column" : "row",
        md: "row",
      }}
      spacing={{ xs: 0, sm: isDrawerOpen ? 0 : 1, md: 2 }}
      marginTop={1}
    >
      <Stack
        direction="row"
        alignItems="baseline"
        spacing={{ xs: 0, sm: isDrawerOpen ? 0 : 1, md: 2 }}
      >
        <InputLabel htmlFor="select-iot-device" sx={{ fontSize: "12px" }}>
          Iot Device:
        </InputLabel>
        <FormControl sx={{ maxWidth: 300 }} size="small" variant="standard">
          <Select
            inputProps={{
              id: "select-iot-device",
            }}
            value={`${device}`}
            onChange={handleDeviceChange}
            displayEmpty
            disabled={isLoading}
            disableUnderline
            sx={{ fontSize: "12px", fontWeight: "bold" }}
            MenuProps={{
              MenuListProps: {
                disablePadding: true,
                dense: true,
              },
            }}
          >
            {iotDevices.map((iotDevice, index) => (
              <MenuItem key={index} value={iotDevice.id}>
                {iotDevice.iot_device_details.name || iotDevice.id}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
      <Stack direction="row" width={1}>
        <Stack
          direction="row"
          alignItems="baseline"
          spacing={{ xs: 2, sm: isDrawerOpen ? 2 : 1, md: 2 }}
        >
          <InputLabel htmlFor="select-sensor" sx={{ fontSize: "12px" }}>
            Sensor:
          </InputLabel>
          <FormControl
            sx={{ maxWidth: { xs: 150, sm: 300 } }}
            size="small"
            variant="standard"
          >
            <Select
              inputProps={{
                id: "select-sensor",
              }}
              value={sensor}
              disabled={isLoading}
              displayEmpty
              onChange={handleSensorChange}
              disableUnderline
              sx={{ fontSize: "12px", fontWeight: "bold" }}
              MenuProps={{
                MenuListProps: {
                  disablePadding: true,
                  dense: true,
                },
              }}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {sensorList?.map((sensor, index) => (
                <MenuItem
                  key={index}
                  value={sensor}
                  disabled={
                    compareTo
                      ? compareTo.deviceId === device &&
                        compareTo.sensor === sensor
                      : false
                  }
                >
                  {sensor}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        {isLoading && <CircularProgress variant="indeterminate" size={20} />}
        <Box marginLeft="auto">
          {!!compareTo && (
            <Tooltip
              title="Clear Compare chart"
              disableFocusListener
              disableTouchListener
              placement="top"
              arrow
              enterDelay={500}
              slotProps={{
                popper: {
                  modifiers: [
                    {
                      name: "offset",
                      options: {
                        offset: [0, -5],
                      },
                    },
                  ],
                },
              }}
            >
              <span>
                <IconButton
                  color="primary"
                  sx={{ padding: 0, marginRight: 1 }}
                  onClick={handleCompareClearClick}
                >
                  <CloseIcon fontSize="medium" />
                </IconButton>
              </span>
            </Tooltip>
          )}
          <Tooltip
            title="Compare chart"
            disableFocusListener
            disableTouchListener
            placement="top"
            arrow
            enterDelay={500}
            slotProps={{
              popper: {
                modifiers: [
                  {
                    name: "offset",
                    options: {
                      offset: [0, -5],
                    },
                  },
                ],
              },
            }}
          >
            <span>
              <IconButton
                color="primary"
                disabled={!sensor || isLoading}
                sx={{ padding: 0, marginRight: 1 }}
                ref={anchorRef}
                onClick={handleCompareClick}
              >
                <CompareIcon fontSize="medium" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip
            title="Download Chart"
            disableFocusListener
            disableTouchListener
            placement="top"
            arrow
            enterDelay={500}
            slotProps={{
              popper: {
                modifiers: [
                  {
                    name: "offset",
                    options: {
                      offset: [0, -5],
                    },
                  },
                ],
              },
            }}
          >
            <span>
              <IconButton
                color="primary"
                disabled={!sensor}
                sx={{ padding: 0 }}
                onClick={handleDownloadClick}
              >
                <DownloadIcon fontSize="medium" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Stack>
    </Stack>
  );
}

export default DeviceSensorSelector;
