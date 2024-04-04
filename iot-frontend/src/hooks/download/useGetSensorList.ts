import { useEffect, useMemo } from "react";
import { Control, UseFormSetValue, useWatch } from "react-hook-form";
import { IDownloadFormInputs } from "../../components/index/ZodSchema/DownloadFormSchema";
import IotDevice from "../../entities/IotDevice";

interface Props {
  control: Control<IDownloadFormInputs>;
  setValue: UseFormSetValue<IDownloadFormInputs>;
  iotDeviceList: (
    | IotDevice
    | {
        id: string;
        iot_device_details: {
          name: string;
        };
        sensor_name_list: never[];
      }
  )[];
}

const addSensorNames = (
  device: IotDevice | { sensor_name_list: string[] },
  sensorSet: Set<string>
) => {
  device.sensor_name_list.forEach((sensorName: string) =>
    sensorSet.add(sensorName)
  );
};

function useGetSensorList({ control, iotDeviceList, setValue }: Props) {
  const iot_device = useWatch({
    control,
    name: "iot_device",
  });

  useEffect(() => {
    setValue("sensors", "all");
  }, [iot_device, setValue]);

  const newIotDeviceList = useMemo(() => {
    const sensorNameSet: Set<string> = new Set(["all"]);

    if (!iot_device || iot_device === "all" || iot_device.length === 0) {
      iotDeviceList.forEach((iotDevice) => {
        addSensorNames(iotDevice, sensorNameSet);
      });
    } else {
      const filteredIotDevice = iotDeviceList.filter((iotDevice) =>
        iot_device.includes(String(iotDevice.id))
      );

      filteredIotDevice.forEach((iotDevice) =>
        addSensorNames(iotDevice, sensorNameSet)
      );
    }
    return Array.from(sensorNameSet);
  }, [iotDeviceList, iot_device]);
  return newIotDeviceList;
}
export default useGetSensorList;
