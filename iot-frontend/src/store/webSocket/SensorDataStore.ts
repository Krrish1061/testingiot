import { StateCreator } from "zustand";
import ISensorDataStore from "../../entities/webSocket/SensorDataStore";

const sensorDataStore: StateCreator<ISensorDataStore> = (set) => ({
  sensorData: null,
  sensorDataUpToDays: {},
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  setSensorDataUpToDays: (iotDeviceId, sensorName, days) =>
    set((state) => ({
      ...state,
      sensorDataUpToDays: {
        ...state.sensorDataUpToDays,
        [iotDeviceId]: {
          ...state.sensorDataUpToDays[iotDeviceId],
          [sensorName]: days,
        },
      },
    })),
  setEmptySensorDataUpToDays: () => set({ sensorDataUpToDays: {} }),
  setSensorDataToNull: () => set({ sensorData: null }),
  setSensorData: (sensorData, deviceId, sensorName) => {
    set((state) => {
      if (state.sensorData) {
        if (deviceId in state.sensorData) {
          if (sensorName in state.sensorData[deviceId]) {
            return {
              ...state,
              sensorData: {
                ...state.sensorData,
                [deviceId]: {
                  ...state.sensorData[deviceId],
                  [sensorName]: [
                    ...sensorData,
                    ...state.sensorData[deviceId][sensorName],
                  ],
                },
              },
            };
          } else {
            return {
              ...state,
              sensorData: {
                ...state.sensorData,
                [deviceId]: {
                  ...state.sensorData[deviceId],
                  [sensorName]: sensorData,
                },
              },
            };
          }
        } else {
          return {
            ...state,
            sensorData: {
              ...state.sensorData,
              [deviceId]: {
                [sensorName]: sensorData,
              },
            },
          };
        }
      } else {
        return {
          ...state,
          sensorData: {
            [deviceId]: { [sensorName]: sensorData },
          },
        };
      }
    });
  },
  handleLiveData: (liveData) => {
    set((state) => {
      const deviceId = +Object.keys(liveData)[0];
      if (!state.sensorData || !(deviceId in state.sensorData)) return state;

      const newSensorData = { ...state.sensorData };
      const liveDataTimestamp = liveData[deviceId].timestamp;

      Object.entries(liveData[deviceId]).forEach(([key, value]) => {
        if (newSensorData[deviceId][key] && key !== "timestamp") {
          // if (
          //   newSensorData[deviceId][key].length === 0 ||
          //   liveDataTimestamp !== newSensorData[deviceId][key][0].date_time
          // ) {
          newSensorData[deviceId][key].push({
            value: value as number,
            date_time: liveDataTimestamp,
          });
          // }
        }
      });

      return { ...state, sensorData: newSensorData };
    });
  },
});

export default sensorDataStore;
