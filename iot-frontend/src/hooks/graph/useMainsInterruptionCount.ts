import { Dayjs } from "dayjs";
import { useEffect, useMemo } from "react";
import useWebSocketStore from "../../store/webSocket/webSocketStore";

interface Props {
  sensor: string;
  iotDeviceId: number | null;
  uptoDays: 1 | 7 | 15;
  startDate: Dayjs;
}

function useMainsInterruptionCount({
  iotDeviceId,
  uptoDays,
  sensor,
  startDate,
}: Props) {
  const sendWebSocketMessage = useWebSocketStore(
    (state) => state.sendWebSocketMessage
  );

  const deviceMainsInterruptionLoading = useWebSocketStore(
    (state) => state.deviceMainsInterruptionLoading
  );
  const setDeviceMainsInterruptionLoading = useWebSocketStore(
    (state) => state.setDeviceMainsInterruptionLoading
  );

  const deviceMainsInterruption = useWebSocketStore(
    (state) => state.deviceMainsInterruption
  );
  const setMainsInterruptionToNull = useWebSocketStore(
    (state) => state.setMainsInterruptionToNull
  );

  const connectionState = useWebSocketStore((state) => state.connectionState);

  useEffect(() => {
    if (connectionState === "disconnected") {
      setMainsInterruptionToNull();
      return;
    }

    if (
      sensor !== "mains" ||
      !iotDeviceId ||
      (deviceMainsInterruptionLoading[iotDeviceId] &&
        deviceMainsInterruptionLoading[iotDeviceId].isLoading)
    )
      return;

    if (
      deviceMainsInterruption &&
      deviceMainsInterruption[iotDeviceId] &&
      deviceMainsInterruption[iotDeviceId][uptoDays] !== undefined
    )
      return;

    if (connectionState === "connected") {
      setDeviceMainsInterruptionLoading(iotDeviceId, true, uptoDays);
      sendWebSocketMessage({
        type: "mains_interruption",
        iot_device_id: iotDeviceId,
        start_date: startDate.format("YYYY-MM-DD"),
      });
    }
  }, [sensor, startDate, connectionState]);

  const isLoading = useMemo(() => {
    return iotDeviceId && deviceMainsInterruptionLoading[iotDeviceId]
      ? deviceMainsInterruptionLoading[iotDeviceId].isLoading || false
      : false;
  }, [iotDeviceId, deviceMainsInterruptionLoading]);

  const count = useMemo(() => {
    if (!deviceMainsInterruption || !iotDeviceId) return null;
    return deviceMainsInterruption[iotDeviceId] &&
      deviceMainsInterruption[iotDeviceId][uptoDays] !== undefined
      ? deviceMainsInterruption[iotDeviceId][uptoDays]
      : null;
  }, [deviceMainsInterruption, iotDeviceId, uptoDays]);

  return { count, isLoading };
}

export default useMainsInterruptionCount;
