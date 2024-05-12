import DownloadIcon from "@mui/icons-material/Download";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import IotDevice from "../../entities/IotDevice";
import useDrawerStore from "../../store/drawerStore";

interface Props {
  device: number;
  iotDevices: IotDevice[];
  sensor: string;
  isLoading: boolean;
  sensorList: string[] | undefined;
  handleDeviceChange: (event: SelectChangeEvent) => void;
  handleSensorChange: (event: SelectChangeEvent) => void;
}

function DeviceSensorSelector({
  device,
  iotDevices,
  sensor,
  sensorList,
  isLoading,
  handleDeviceChange,
  handleSensorChange,
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
                <MenuItem key={index} value={sensor}>
                  {sensor}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        {isLoading && <CircularProgress variant="indeterminate" size={20} />}
        <Tooltip
          title="Download Chart"
          disableFocusListener
          disableTouchListener
          placement="top"
          arrow
          slotProps={{
            popper: {
              modifiers: [
                {
                  name: "offset",
                  options: {
                    offset: [0, -14],
                  },
                },
              ],
            },
          }}
        >
          <IconButton color="primary" sx={{ padding: 0, marginLeft: "auto" }}>
            <DownloadIcon fontSize="medium" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  );
}

export default DeviceSensorSelector;
