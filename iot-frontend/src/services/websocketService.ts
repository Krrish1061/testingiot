import SendMessage from "../entities/WebSocket";

//  error handling and improve and re-write it.
class WebSocketService {
  websocket: WebSocket | null = null;

  connect(endpoint: string): void {
    this.websocket = new WebSocket(endpoint);

    this.websocket.onopen = () => {
      console.log("WebSocket connection established");
    };

    this.websocket.onmessage = (event) => {
      console.log(event.data);
    };

    this.websocket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    this.websocket.onerror = (event) => {
      // Happens on Websocket REJECTs
      console.log("Socket error", event);
    };
  }

  send(message: SendMessage): void {
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
