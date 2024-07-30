import ILiveData from "./LiveData";
import {
  IDeviceMainsInterruption,
  IDeviceMainsInterruptionLoading,
} from "./MainsInterruption";
import ISensorData from "./SensorData";

interface ISensor {
  [sensorName: string]: ISensorData[];
}

interface IDeviceSensorData {
  [iotDeviceId: number]: ISensor;
}

interface ISensorDataUpToDays {
  [sensorName: string]: 1 | 7 | 15;
}

interface IDeviceDataUpToDays {
  [iotDeviceId: number]: ISensorDataUpToDays;
}

interface ISensorDataStore {
  sensorData: IDeviceSensorData | null;
  sensorDataUpToDays: IDeviceDataUpToDays;
  isLoading: boolean;
  deviceMainsInterruption: IDeviceMainsInterruption | null;
  deviceMainsInterruptionLoading: IDeviceMainsInterruptionLoading;
  setIsLoading: (loading: boolean) => void;
  setSensorDataUpToDays: (
    iotDeviceId: number,
    sensorName: string,
    days: 1 | 7 | 15
  ) => void;
  setEmptySensorDataUpToDays: () => void;
  setSensorDataToNull: () => void;
  setSensorData: (
    sensorData: ISensorData[],
    deviceId: number,
    sensorName: string
  ) => void;
  handleLiveData: (data: ILiveData) => void;
  setDeviceMainsInterruption: (iotDeviceId: number, count: number) => void;
  setDeviceMainsInterruptionLoading: (
    iotDeviceId: number,
    isLoading: boolean,
    days?: 1 | 7 | 15
  ) => void;
  setMainsInterruptionToNull: () => void;
}

export default ISensorDataStore;
