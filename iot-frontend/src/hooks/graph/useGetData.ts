import { useEffect, useMemo, useState } from "react";
import { processData } from "../../components/graph/chartHelpers";
import useWebSocketStore from "../../store/webSocket/webSocketStore";
import useGetAllSensors from "../sensor/useGetAllSensors";

interface Props {
  sensor: string;
  deviceId: number | null;
  compareTo: {
    deviceId: number;
    sensor: string;
  } | null;
}

function useGetData({ sensor, deviceId, compareTo }: Props) {
  const { data: sensorList } = useGetAllSensors();
  const sensorData = useWebSocketStore((state) => state.sensorData);
  const [graphData, setGraphData] = useState<{ x: number; y: number }[] | null>(
    null
  );
  const [compareData, setCompareData] = useState<
    { x: number; y: number }[] | null
  >(null);

  const { sensorSymbol, isSensorValueBoolean } = useMemo(() => {
    const sensorObject = sensorList?.find((item) => item.name === sensor);
    return {
      sensorSymbol: sensorObject?.symbol || null,
      isSensorValueBoolean: sensorObject?.is_value_boolean || false,
    };
  }, [sensor, sensorList]);

  const { compareSensorSymbol, isCompareSensorValueBoolean } = useMemo(() => {
    const sensorObject = sensorList?.find(
      (item) => item.name === compareTo?.sensor
    );
    return {
      compareSensorSymbol: sensorObject?.symbol || null,
      isCompareSensorValueBoolean: sensorObject?.is_value_boolean || false,
    };
  }, [compareTo, sensorList]);

  useEffect(() => {
    if (!sensorData || sensor === "" || deviceId === null) return;
    if (deviceId in sensorData && sensor in sensorData[deviceId]) {
      setGraphData(processData(sensorData[deviceId][sensor]));
    }
  }, [sensorData, sensor, deviceId]);

  useEffect(() => {
    if (!sensorData || compareTo === null) return;
    const compareDeviceId = compareTo.deviceId;
    const compareSensor = compareTo.sensor;
    if (
      compareDeviceId in sensorData &&
      compareSensor in sensorData[compareDeviceId]
    ) {
      setCompareData(processData(sensorData[compareDeviceId][compareSensor]));
    }
  }, [sensorData, compareTo]);

  return {
    graphData,
    compareData,
    sensorSymbol,
    isSensorValueBoolean,
    compareSensorSymbol,
    isCompareSensorValueBoolean,
  };
}

export default useGetData;
