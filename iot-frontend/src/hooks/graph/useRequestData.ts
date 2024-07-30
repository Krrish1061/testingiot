import { Dayjs } from "dayjs";
import { useCallback, useEffect } from "react";
import useWebSocketStore from "../../store/webSocket/webSocketStore";
import ISendMessage from "../../entities/webSocket/SendMessage";

interface Props {
  sensor: string;
  deviceId: number | null;
  startDate: Dayjs;
  endDate: Dayjs;
  selectedDays: 1 | 7 | 15;
  compareTo: {
    deviceId: number;
    sensor: string;
  } | null;
}

function useRequestData({
  sensor,
  deviceId,
  startDate,
  endDate,
  selectedDays,
  compareTo,
}: Props) {
  const sendWebSocketMessage = useWebSocketStore(
    (state) => state.sendWebSocketMessage
  );
  const sensorDataUpToDays = useWebSocketStore(
    (state) => state.sensorDataUpToDays
  );
  const setIsLoading = useWebSocketStore((state) => state.setIsLoading);
  const connectionState = useWebSocketStore((state) => state.connectionState);
  const setSensorDataUpToDays = useWebSocketStore(
    (state) => state.setSensorDataUpToDays
  );
  const setSensorDataToNull = useWebSocketStore(
    (state) => state.setSensorDataToNull
  );
  const setEmptySensorDataUpToDays = useWebSocketStore(
    (state) => state.setEmptySensorDataUpToDays
  );

  const sendMessage = useCallback(
    (
      startDate: Dayjs,
      endDate: Dayjs,
      iotDeviceId: number,
      sensorName: string
    ) => {
      if (sensorName) {
        const message: ISendMessage = {
          type: "sensor_data",
          sensor_name: sensorName,
          iot_device_id: iotDeviceId,
          start_date: startDate.format("YYYY-MM-DD"),
          end_date: endDate.format("YYYY-MM-DD"),
        };
        sendWebSocketMessage(message);
      }
    },
    [sendWebSocketMessage]
  );

  const handleRequestingDataFromWebSocket = useCallback(
    (
      sensor: string,
      deviceId: number,
      startDate: Dayjs,
      endDate: Dayjs,
      selectedDays: 1 | 7 | 15
    ) => {
      const deviceData = sensorDataUpToDays[deviceId];
      const sensorUptoDays = deviceData?.[sensor];

      if (connectionState === "connected") {
        if ((!sensorUptoDays || selectedDays > sensorUptoDays) && sensor) {
          setIsLoading(true);
          const subtractDays =
            sensorUptoDays === 1 ? 1 : sensorUptoDays === 7 ? 7 : 0;
          sendMessage(
            startDate,
            endDate.subtract(subtractDays, "day"),
            deviceId,
            sensor
          );
          setSensorDataUpToDays(deviceId, sensor, selectedDays);
        }
      } else if (connectionState === "disconnected") {
        setIsLoading(false);
        if (Object.keys(sensorDataUpToDays).length !== 0) {
          setEmptySensorDataUpToDays();
          setSensorDataToNull();
        }
      }
    },
    [
      connectionState,
      sensorDataUpToDays,
      sendMessage,
      setIsLoading,
      setEmptySensorDataUpToDays,
      setSensorDataToNull,
      setSensorDataUpToDays,
    ]
  );

  useEffect(() => {
    if (deviceId) {
      handleRequestingDataFromWebSocket(
        sensor,
        deviceId,
        startDate,
        endDate,
        selectedDays
      );
    }
    if (compareTo) {
      handleRequestingDataFromWebSocket(
        compareTo.sensor,
        compareTo.deviceId,
        startDate,
        endDate,
        selectedDays
      );
    }
  }, [
    sensor,
    deviceId,
    startDate,
    endDate,
    selectedDays,
    compareTo,
    handleRequestingDataFromWebSocket,
  ]);
}

export default useRequestData;
