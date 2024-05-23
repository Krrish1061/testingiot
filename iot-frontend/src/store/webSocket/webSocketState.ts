import { StateCreator } from "zustand";
import IWebSocketStateStore from "../../entities/webSocket/WebSocketStateStore";
import webSocketService from "../../services/websocketService";

const webSocketState: StateCreator<IWebSocketStateStore> = (set) => ({
  websocket: null,
  connectionState: "closed",
  subscribedGroup: null,

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
});

export default webSocketState;
