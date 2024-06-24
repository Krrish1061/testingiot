import { StateCreator } from "zustand";
import IWebSocketStateStore, {
  IwebSocketState,
} from "../../entities/webSocket/WebSocketStateStore";
import webSocketService from "../../services/websocketService";
import { storeResetFns } from "../resetAllStore";

const initialWebSocketState = {
  websocket: null,
  connectionState: "closed" as IwebSocketState,
  subscribedGroup: null,
};

const webSocketState: StateCreator<IWebSocketStateStore> = (set) => {
  storeResetFns.add(() => set(initialWebSocketState));
  return {
    ...initialWebSocketState,
    setSubscribedGroup: (group_name) => set({ subscribedGroup: group_name }),

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
  };
};

export default webSocketState;
