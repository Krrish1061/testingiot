import pako from "pako";
import { StateCreator } from "zustand";
import ILiveData from "../../entities/webSocket/LiveData";
import ILiveDataStore from "../../entities/webSocket/LiveDataStore";
import { IReceivedMessageMainsInterruption } from "../../entities/webSocket/MainsInterruption";
import IReceivedMessage from "../../entities/webSocket/ReceivedMessage";
import ISensorData from "../../entities/webSocket/SensorData";
import ISensorDataStore from "../../entities/webSocket/SensorDataStore";
import IWebSocketMessageStore from "../../entities/webSocket/webSocketMessageStore";
import webSocketService from "../../services/websocketService";

const webSocketMessage: StateCreator<
  ISensorDataStore & ILiveDataStore,
  [],
  [],
  IWebSocketMessageStore
> = (_set, get) => ({
  messageWebSocket: () => {
    webSocketService.websocket!.onmessage = async (event) => {
      let receivedMessage = event.data;
      if (receivedMessage instanceof Blob) {
        const arrayBuffer = await event.data.arrayBuffer();
        receivedMessage = pako.inflate(arrayBuffer, { to: "string" });
      }
      const [messageInfo, data] = JSON.parse(
        receivedMessage
      ) as IReceivedMessage;
      if (
        messageInfo.message_type === "initial_data" ||
        messageInfo.message_type === "live_data"
      ) {
        get().setLiveData(data as ILiveData);
        // for updating the graph in sensorDataStore
        if (messageInfo.message_type === "live_data") {
          get().handleLiveData(data as ILiveData);
        }
      } else if (messageInfo.message_type === "sensor_data") {
        const deviceId = messageInfo.iot_device_id as number;
        const sensorName = messageInfo.sensor_name as string;
        get().setSensorData(data as ISensorData[], deviceId, sensorName);
        get().setIsLoading(false);
      } else if (messageInfo.message_type === "mains_interruption") {
        const deviceId = messageInfo.iot_device_id as number;
        const count = (data as IReceivedMessageMainsInterruption).count;
        get().setDeviceMainsInterruption(deviceId, count);
        get().setDeviceMainsInterruptionLoading(deviceId, false);
      }
    };
  },
});

export default webSocketMessage;
