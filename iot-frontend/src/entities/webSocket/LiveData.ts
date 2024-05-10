export interface IData {
  [sensorName: string]: number | string;
  timestamp: string;
}

interface ILiveData {
  [iot_device_id: number]: IData;
}

export default ILiveData;
