import { StateCreator, create } from "zustand";
import IConnectWebsocketStore from "../../entities/webSocket/ConnectWebSocket";
import ILiveDataStore from "../../entities/webSocket/LiveDataStore";
import ISensorDataStore from "../../entities/webSocket/SensorDataStore";
import IWebSocketStateStore from "../../entities/webSocket/WebSocketStateStore";
import IWebSocketMessageStore from "../../entities/webSocket/webSocketMessageStore";
import liveDataStore from "./LiveDataStore";
import sensorDataStore from "./SensorDataStore";
import webSocketMessage from "./webSocketMessage";
import webSocketState from "./webSocketState";

const connectToWebsocket: StateCreator<
  IWebSocketMessageStore & IWebSocketStateStore,
  [],
  [],
  IConnectWebsocketStore
> = (_set, get) => ({
  connectToWebsocket: (endpoint) => {
    get().connectWebSocket(endpoint);
    get().messageWebSocket();
  },
});

const useWebSocketStore = create<
  ISensorDataStore &
    ILiveDataStore &
    IWebSocketStateStore &
    IWebSocketMessageStore &
    IConnectWebsocketStore
>()((...set) => ({
  ...liveDataStore(...set),
  ...sensorDataStore(...set),
  ...webSocketMessage(...set),
  ...webSocketState(...set),
  ...connectToWebsocket(...set),
}));

export default useWebSocketStore;
