import { useEffect, useState } from "react";
import ISensorData from "../../entities/webSocket/SensorData";
import useWebSocketStore from "../../store/webSocket/webSocketStore";

interface Props {
  sensor: string;
  deviceId: number | null;
}

function useGetData({ sensor, deviceId }: Props) {
  const isLoading = useWebSocketStore((state) => state.isLoading);
  const sensorData = useWebSocketStore((state) => state.sensorData);
  const [graphData, setGraphData] = useState<ISensorData[] | null>(null);

  useEffect(() => {
    if (!sensorData || sensor === "" || deviceId === null) return;
    if (deviceId in sensorData && sensor in sensorData[deviceId])
      setGraphData(sensorData[deviceId][sensor]);
  }, [sensorData, sensor, deviceId]);

  return { graphData, isLoading };
}

export default useGetData;
