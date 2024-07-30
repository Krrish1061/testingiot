import ILiveData from "./LiveData";
import { IReceivedMessageMainsInterruption } from "./MainsInterruption";
import ISensorData from "./SensorData";

interface MessageInfo {
  message_type: string;
  sensor_name?: string;
  iot_device_id?: number;
}

type IReceivedMessage = [
  MessageInfo,
  ILiveData | ISensorData[] | IReceivedMessageMainsInterruption
];

export default IReceivedMessage;
