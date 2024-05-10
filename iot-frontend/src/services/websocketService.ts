import ISendMessage from "../entities/webSocket/SendMessage";

class WebSocketService {
  websocket: WebSocket | null = null;

  connect(endpoint: string): void {
    this.websocket = new WebSocket(endpoint);
  }

  send(message: ISendMessage): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(message));
    }
  }

  close(): void {
    if (this.websocket) {
      this.websocket.close();
    }
  }
}

const webSocketService = new WebSocketService();

export default webSocketService;
