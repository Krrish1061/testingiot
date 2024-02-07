import IotDeviceSensor from "../../../entities/IotDeviceSensor";
import { IFormInputs } from "../SensorField";

export const getObjectKeys = (obj: IFormInputs) => Object.keys(obj);

export const getMissingKeys = (
  fields: IFormInputs,
  newFields: IFormInputs | null
) => {
  // memorized the below calculation
  const keys = getObjectKeys(fields);
  const totalKeys = newFields ? keys.concat(getObjectKeys(newFields)) : keys;
  const keyPattern = "field";
  let index = 1;
  let currentKey = keyPattern + index;

  while (totalKeys.includes(currentKey)) {
    index++;
    currentKey = keyPattern + index;
  }
  return currentKey;
};

export const requiredFormat = (deviceSensors: IotDeviceSensor[]) => {
  const result: IFormInputs = {};
  deviceSensors.map(
    (row) =>
      (result[row.field_name] = {
        sensor_name: row.sensor_name,
        max_limit: row.max_limit,
        min_limit: row.min_limit,
      })
  );

  return result;
};
