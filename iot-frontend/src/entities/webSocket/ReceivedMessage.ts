import ILiveData from "./LiveData";
import ISensorData from "./SensorData";

interface MessageInfo {
  message_type: string;
  sensor_name?: string;
  iot_device_id?: number;
}

type IReceivedMessage = [MessageInfo, ILiveData | ISensorData[]];

export default IReceivedMessage;
