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

type webSocketState = "connecting" | "connected" | "disconnected" | "closed";

interface WebSocketStoreState {
  websocket: WebSocket | null;
  liveData: LiveData | null;
  connectionState: webSocketState;
  setConnectionState: (webSocketState: webSocketState) => void;
  setliveDataToNull: () => void;
  connectWebSocket: (endpoint: string) => void;
  closeWebSocket: () => void;
  sendWebSocketMessage: (message: SendMessage) => void;
}

const useWebSocketStore = create<WebSocketStoreState>((set) => ({
  websocket: null,
  liveData: null,
  connectionState: "closed",

  setliveDataToNull: () => set({ liveData: null }),

  setConnectionState: (webSocketState) =>
    set({ connectionState: webSocketState }),

  connectWebSocket: (endpoint: string) => {
    set({ connectionState: "connecting" });
    webSocketService.connect(endpoint);

    webSocketService.websocket!.onopen = () => {
      set({
        websocket: webSocketService.websocket,
        connectionState: "connected",
      });
    };

    webSocketService.websocket!.onmessage = (event) => {
      const data = JSON.parse(event.data as string) as LiveData;
      set((state) => {
        if (state.liveData) {
          const device_id = +Object.keys(data)[0];
          const newData = { ...state.liveData[device_id], ...data[device_id] };
          return {
            ...state,
            liveData: {
              ...state.liveData,
              [device_id]: newData,
            },
          };
        } else {
          return {
            ...state,
            liveData: data,
          };
        }
      });
    };

    webSocketService.websocket!.onclose = () => {
      set({
        connectionState: "disconnected",
      });
    };

    webSocketService.websocket!.onerror = () => {
      set({
        connectionState: "disconnected",
      });
    };
  },

  closeWebSocket: () => {
    webSocketService.close();
    set({ websocket: null, connectionState: "closed" });
  },

  sendWebSocketMessage: (message) => {
    webSocketService.send(message);
  },
}));

export default useWebSocketStore;
