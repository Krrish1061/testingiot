import { useMemo } from "react";
import Button from "@mui/material/Button";
import IotDevice from "../../entities/IotDevice";
import { Dispatch, SetStateAction } from "react";

interface Props {
  deviceID: number;
  index: number;
  iotDeviceList: IotDevice[] | undefined;
  setIotDevice: Dispatch<SetStateAction<IotDevice | null>>;
}

const LiveDataCardButton = ({
  deviceID,
  index,
  iotDeviceList,
  setIotDevice,
}: Props) => {
  const iotDevice = useMemo(() => {
    return (
      iotDeviceList?.find((iotDevice) => iotDevice.id === deviceID) || null
    );
  }, [iotDeviceList, deviceID]);

  const deviceName = iotDevice?.iot_device_details?.name || `Room ${index + 1}`;

  const handleClick = () => {
    setIotDevice(iotDevice);
  };

  return (
    <Button
      size="large"
      onClick={handleClick}
      disableRipple
      sx={{
        padding: 0,
        justifyContent: "flex-start",
        "&.MuiButtonBase-root:hover": {
          bgcolor: "transparent",
        },
      }}
    >
      {deviceName}
    </Button>
  );
};

export default LiveDataCardButton;
