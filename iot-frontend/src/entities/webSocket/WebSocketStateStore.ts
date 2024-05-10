import ISendMessage from "./SendMessage";

type IwebSocketState = "connecting" | "connected" | "disconnected" | "closed";

interface IWebSocketStateStore {
  websocket: WebSocket | null;
  connectionState: IwebSocketState;
  setConnectionState: (webSocketState: IwebSocketState) => void;
  connectWebSocket: (endpoint: string) => void;
  closeWebSocket: () => void;
  sendWebSocketMessage: (message: ISendMessage) => void;
}

export default IWebSocketStateStore;
