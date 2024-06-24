import ISendMessage from "./SendMessage";

export type IwebSocketState =
  | "connecting"
  | "connected"
  | "disconnected"
  | "closed";

interface IWebSocketStateStore {
  websocket: WebSocket | null;
  connectionState: IwebSocketState;
  subscribedGroup: null | string;
  setSubscribedGroup: (group_name: null | string) => void;
  setConnectionState: (webSocketState: IwebSocketState) => void;
  connectWebSocket: (endpoint: string) => void;
  closeWebSocket: () => void;
  sendWebSocketMessage: (message: ISendMessage) => void;
}

export default IWebSocketStateStore;
