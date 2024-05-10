import ILiveData from "./LiveData";
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
}

export default ISensorDataStore;
