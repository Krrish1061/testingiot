import { useEffect, useMemo, useState } from "react";
import IotDevice from "../../entities/IotDevice";
import useGetAllIotDevice from "../iotDevice/useGetAllIotDevice";
import useGetAllSensors from "../sensor/useGetAllSensors";

interface Props {
  username?: string;
  companySlug?: string;
  device: number | null;
  sensor: string;
}

function useGetDeviceSensorList({
  username,
  companySlug,
  device,
  sensor,
}: Props) {
  const { data: iotDeviceList } = useGetAllIotDevice();
  const { data: sensorList } = useGetAllSensors();
  const [iotDevices, setIotDevices] = useState<IotDevice[]>([]);

  const deviceSensorList = useMemo(() => {
    let sensors: string[] = [];
    if (device !== null) {
      const iot_device = iotDevices?.find(
        (iot_device) => iot_device.id === device
      );
      sensors = iot_device?.sensor_name_list || [];
    }

    return sensors;
  }, [device, iotDevices]);

  const { sensorSymbol, isSensorValueBoolean } = useMemo(() => {
    const sensorObject = sensorList?.find((item) => item.name === sensor);
    return {
      sensorSymbol: sensorObject?.symbol || null,
      isSensorValueBoolean: sensorObject?.is_value_boolean || false,
    };
  }, [sensor, sensorList]);

  useEffect(() => {
    let iotDevice: IotDevice[] | undefined = [];
    if (companySlug) {
      iotDevice = iotDeviceList?.filter(
        (iotDevice) => iotDevice.company === companySlug
      );
    } else if (username) {
      iotDevice = iotDeviceList?.filter(
        (iotDevice) => iotDevice.user === username
      );
    }
    setIotDevices(iotDevice || []);
  }, [iotDeviceList, username, companySlug]);

  return { iotDevices, deviceSensorList, sensorSymbol, isSensorValueBoolean };
}

export default useGetDeviceSensorList;
