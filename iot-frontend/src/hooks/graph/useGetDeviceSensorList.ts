import { useEffect, useMemo, useState } from "react";
import UserTypes from "../../constants/userTypes";
import IotDevice from "../../entities/IotDevice";
import useAuthStore from "../../store/authStore";
import useGetAllIotDevice from "../iotDevice/useGetAllIotDevice";

interface Props {
  username?: string;
  companySlug?: string;
  device: number | null;
}

function useGetDeviceSensorList({ username, companySlug, device }: Props) {
  const user = useAuthStore((state) => state.user);
  const isUserSuperAdmin = useAuthStore((state) => state.isUserSuperAdmin);
  const { data: iotDeviceList } = useGetAllIotDevice();
  const [iotDevices, setIotDevices] = useState<IotDevice[]>([]);

  const deviceSensorList = useMemo(() => {
    if (device === null) return [];
    const iotDevice = iotDevices.find((iotDevice) => iotDevice.id === device);
    return iotDevice?.sensor_name_list || [];
  }, [device, iotDevices]);

  useEffect(() => {
    if (!iotDeviceList) return;
    let filteredDevices: IotDevice[] = [];

    if (isUserSuperAdmin) {
      if (companySlug) {
        filteredDevices = iotDeviceList.filter(
          (iotDevice) => iotDevice.company === companySlug
        );
      } else if (username) {
        filteredDevices = iotDeviceList.filter(
          (iotDevice) => iotDevice.user === username
        );
      }
    } else if (user) {
      const {
        is_associated_with_company,
        company,
        type,
        created_by,
        username,
      } = user;
      if (is_associated_with_company) {
        filteredDevices = iotDeviceList.filter(
          (iotDevice) => iotDevice.company === company
        );
      } else if (type === UserTypes.admin) {
        filteredDevices = iotDeviceList.filter(
          (iotDevice) => iotDevice.user === username
        );
      } else {
        filteredDevices = iotDeviceList.filter(
          (iotDevice) => iotDevice.user === created_by
        );
      }
    }

    setIotDevices(filteredDevices);
  }, [iotDeviceList, username, companySlug, isUserSuperAdmin, user]);

  return { iotDeviceList, iotDevices, deviceSensorList };
}

export default useGetDeviceSensorList;
