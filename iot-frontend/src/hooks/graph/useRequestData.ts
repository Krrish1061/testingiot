import { Dayjs } from "dayjs";
import { useCallback, useEffect } from "react";
import useWebSocketStore from "../../store/webSocket/webSocketStore";

interface Props {
  sensor: string;
  deviceId: number | null;
  startDate: Dayjs;
  endDate: Dayjs;
  selectedDays: 1 | 7 | 15;
}

function useRequestData({
  sensor,
  deviceId,
  startDate,
  endDate,
  selectedDays,
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
    (startDate: Dayjs, endDate: Dayjs) => {
      if (sensor && deviceId !== null) {
        const message = {
          type: "sensor_data",
          sensor_name: sensor,
          iot_device_id: deviceId,
          start_date: startDate.format("YYYY-MM-DD"),
          end_date: endDate.format("YYYY-MM-DD"),
        };
        setIsLoading(true);
        setSensorDataUpToDays(deviceId, sensor, selectedDays);
        sendWebSocketMessage(message);
      }
    },
    [
      deviceId,
      selectedDays,
      sensor,
      sendWebSocketMessage,
      setIsLoading,
      setSensorDataUpToDays,
    ]
  );

  useEffect(() => {
    if (!deviceId) return;
    const deviceData = sensorDataUpToDays[deviceId];
    const sensorUptoDays = deviceData && deviceData[sensor];
    if (
      connectionState === "connected" &&
      (!sensorUptoDays || selectedDays > sensorUptoDays)
    ) {
      switch (sensorUptoDays) {
        case 1:
          sendMessage(startDate, endDate.subtract(1, "day"));
          break;
        case 7:
          sendMessage(startDate, endDate.subtract(7, "day"));
          break;

        default:
          sendMessage(startDate, endDate);
      }
    } else if (connectionState === "disconnected") {
      setIsLoading(false);
      if (Object.keys(sensorDataUpToDays).length !== 0) {
        setEmptySensorDataUpToDays();
        setSensorDataToNull();
      }
    }
  }, [
    sensor,
    startDate,
    endDate,
    selectedDays,
    deviceId,
    sensorDataUpToDays,
    connectionState,
    sendMessage,
    setIsLoading,
    setEmptySensorDataUpToDays,
    setSensorDataToNull,
  ]);
}

export default useRequestData;
