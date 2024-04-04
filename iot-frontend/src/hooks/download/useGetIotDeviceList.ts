import { useEffect, useMemo } from "react";
import { Control, UseFormSetValue, useWatch } from "react-hook-form";
import { IDownloadFormInputs } from "../../components/index/ZodSchema/DownloadFormSchema";
import IotDevice from "../../entities/IotDevice";
import useGetAllIotDevice from "../iotDevice/useGetAllIotDevice";

interface Props {
  control: Control<IDownloadFormInputs>;
  setValue: UseFormSetValue<IDownloadFormInputs>;
}

const filterIotDevices = (
  devices: IotDevice[],
  list: string | string[] | null | undefined,
  key: "user" | "company"
) => {
  if (list === "all") {
    return devices.filter((device) => device[key]);
  } else if (Array.isArray(list) && list.length > 0) {
    return devices.filter(
      (device) => device[key] && list.includes(device[key]!)
    );
  }
  return [];
};

function useGetIotDeviceList({ control, setValue }: Props) {
  const { data: iotDeviceList } = useGetAllIotDevice();
  const [userList, companyList] = useWatch({
    control,
    name: ["user", "company"],
  });

  useEffect(() => {
    setValue("sensors", "all");
    setValue("iot_device", "all");
  }, [userList, companyList, setValue]);

  const newIotDeviceList = useMemo(() => {
    if (!iotDeviceList) return [];

    const hasUserFilter =
      userList && (userList === "all" || userList.length > 0);
    const hasCompanyFilter =
      companyList && (companyList === "all" || companyList.length > 0);

    if (!hasUserFilter && !hasCompanyFilter) {
      return [
        {
          id: "all",
          iot_device_details: { name: "all" },
          sensor_name_list: [],
        },
        ...iotDeviceList,
      ];
    }

    const userFilteredDevices = filterIotDevices(
      iotDeviceList,
      userList,
      "user"
    );

    const companyFilteredDevices = filterIotDevices(
      iotDeviceList,
      companyList,
      "company"
    );

    return [
      { id: "all", iot_device_details: { name: "all" }, sensor_name_list: [] },
      ...userFilteredDevices,
      ...companyFilteredDevices,
    ];
  }, [iotDeviceList, companyList, userList]);
  return newIotDeviceList;
}

export default useGetIotDeviceList;
