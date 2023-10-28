import { create } from "zustand";
import webSocketService from "../services/websocketService";
import SendMessage from "../entities/WebSocket";

export interface Data {
  [sensorName: string]: number | string;
  timestamp: string;
}

interface LiveData {
  [iot_device_id: number]: Data;
}

interface WebSocketStoreState {
  websocket: WebSocket | null;
  liveData: LiveData | null;
  connectWebSocket: (endpoint: string) => void;
  closeWebSocket: () => void;
  sendWebSocketMessage: (message: SendMessage) => void;
}

const useWebSocketStore = create<WebSocketStoreState>((set) => ({
  websocket: null,
  liveData: null,

  connectWebSocket: (endpoint: string) => {
    webSocketService.connect(endpoint);
    set({ websocket: webSocketService.websocket });

    webSocketService.websocket!.onmessage = (event) => {
      const data = JSON.parse(event.data as string) as LiveData;
      console.log("websocket", data);
      set({ liveData: data });
    };
  },

  closeWebSocket: () => {
    webSocketService.close();
    set({ websocket: null });
  },

  sendWebSocketMessage: (message) => {
    webSocketService.send(message);
  },
}));

export default useWebSocketStore;
