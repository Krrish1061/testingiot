import { StateCreator } from "zustand";
import ISensorDataStore from "../../entities/webSocket/SensorDataStore";
import { storeResetFns } from "../resetAllStore";

const initialSensorDataState = {
  sensorData: null,
  sensorDataUpToDays: {},
  isLoading: false,
  deviceMainsInterruption: null,
  deviceMainsInterruptionLoading: {},
};

const sensorDataStore: StateCreator<ISensorDataStore> = (set) => {
  storeResetFns.add(() => set(initialSensorDataState));
  return {
    ...initialSensorDataState,
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
        const newDeviceMainsInterruption = { ...state.deviceMainsInterruption };
        const liveDataTimestamp = liveData[deviceId].timestamp;

        Object.entries(liveData[deviceId]).forEach(([key, value]) => {
          if (key !== "timestamp" && newSensorData[deviceId][key]) {
            newSensorData[deviceId][key].push({
              value: value as number,
              date_time: liveDataTimestamp,
            });
            if (key === "mains") {
              // there no need to update mains interrpution count if there is no mains data in sensorData dictionary
              if (
                newDeviceMainsInterruption &&
                newDeviceMainsInterruption[deviceId]
              ) {
                const latestValue =
                  newDeviceMainsInterruption[deviceId].lastestValue;
                if (latestValue !== null) {
                  Object.entries(newDeviceMainsInterruption[deviceId]).forEach(
                    ([days, count]) => {
                      if (latestValue && !value)
                        newDeviceMainsInterruption[deviceId][+days] = count + 1;

                      newDeviceMainsInterruption[deviceId].lastestValue =
                        +value;
                    }
                  );
                }
              }
            }
          }
        });

        return {
          ...state,
          sensorData: newSensorData,
          deviceMainsInterruption: newDeviceMainsInterruption,
        };
      });
    },
    setDeviceMainsInterruption: (iotDeviceId, count) =>
      set((state) => {
        const days = state.deviceMainsInterruptionLoading[iotDeviceId].days;
        const arraylength =
          (state.sensorData && state.sensorData[iotDeviceId]["mains"].length) ||
          null;
        const lastestValue =
          state.sensorData && arraylength
            ? state.sensorData[iotDeviceId]["mains"][arraylength - 1].value
            : null;
        if (state.deviceMainsInterruption === null) {
          return {
            ...state,
            deviceMainsInterruption: {
              [iotDeviceId]: {
                [days]: count,
                lastestValue: lastestValue,
              },
            },
          };
        }
        return {
          ...state,
          deviceMainsInterruption: {
            ...state.deviceMainsInterruption,
            [iotDeviceId]: {
              ...state.deviceMainsInterruption[iotDeviceId],
              [days]: count,
              lastestValue: lastestValue,
            },
          },
        };
      }),

    setDeviceMainsInterruptionLoading: (iotDeviceId, isLoading, days) =>
      set((state) => {
        if (days) {
          if (!state.deviceMainsInterruptionLoading) {
            return {
              ...state,
              deviceMainsInterruptionLoading: {
                [iotDeviceId]: {
                  days: days,
                  isLoading: isLoading,
                },
              },
            };
          }
          return {
            ...state,
            deviceMainsInterruptionLoading: {
              ...state.deviceMainsInterruptionLoading,
              [iotDeviceId]: {
                ...state.deviceMainsInterruptionLoading[iotDeviceId],
                days: days,
                isLoading: isLoading,
              },
            },
          };
        } else {
          return {
            ...state,
            deviceMainsInterruptionLoading: {
              [iotDeviceId]: {
                ...state.deviceMainsInterruptionLoading[iotDeviceId],
                isLoading: isLoading,
              },
            },
          };
        }
      }),
    setMainsInterruptionToNull: () =>
      set({
        deviceMainsInterruption: null,
        deviceMainsInterruptionLoading: {},
      }),
  };
};

export default sensorDataStore;
