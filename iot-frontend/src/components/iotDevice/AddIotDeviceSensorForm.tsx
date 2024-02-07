import Box from "@mui/material/Box";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Button from "@mui/material/Button";
import IotDevice from "../../entities/IotDevice";
import useGetAllSensors from "../../hooks/sensor/useGetAllSensors";
import Sensor from "../../entities/Sensor";
import SensorField, { IFormInputs } from "./SensorField";
import { ZodIssue, ZodError } from "zod";
import useAddIotDeviceSensors from "../../hooks/iotDevice/useAddIotDeviceSensors";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import DeviceSensorSchema from "./zodSchema/DeviceSensorSchema";

interface Props {
  iotDevice: IotDevice;
  handleNext: () => void;
}

function AddIotDeviceSensorForm({ handleNext, iotDevice }: Props) {
  const { data: sensorList } = useGetAllSensors();
  const { mutate, isLoading, isSuccess } = useAddIotDeviceSensors(iotDevice.id);
  const [errors, setErrors] = useState<ZodIssue[] | null>(null);
  const [fields, setFields] = useState<IFormInputs>({
    field1: { sensor_name: "", max_limit: null, min_limit: null },
    field2: { sensor_name: "", max_limit: null, min_limit: null },
    field3: { sensor_name: "", max_limit: null, min_limit: null },
  });

  useEffect(() => {
    if (isSuccess) {
      handleNext();
    }
  }, [isSuccess, handleNext]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      DeviceSensorSchema.parse(fields);
      mutate(fields);
    } catch (err) {
      if (err instanceof ZodError) {
        setErrors(err.errors);
      }
    }
  };

  const getObjectKeys = (obj: IFormInputs) => Object.keys(obj);

  const getMissingKeys = () => {
    const keys = getObjectKeys(fields);
    const keyPattern = "field";
    let index = 1;
    let currentKey = keyPattern + index;

    while (keys.includes(currentKey)) {
      index++;
      currentKey = keyPattern + index;
    }
    return currentKey;
  };

  const handleAddField = () => {
    const newFieldName = getMissingKeys();
    setErrors(null);
    setFields({
      ...fields,
      [newFieldName]: { sensor_name: "", max_limit: null, min_limit: null },
    });
  };

  const handleSensorFieldChange = (data: Sensor | null, fieldName: string) => {
    setErrors(null);
    setFields({
      ...fields,
      [fieldName]: {
        ...fields[fieldName],
        sensor_name: data?.name || "",
      },
    });
  };

  const handleMaxMinFieldChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    fieldName: string,
    key: "max_limit" | "min_limit"
  ) => {
    let inputValue: number | null = parseInt(event.target.value);
    inputValue = !isNaN(inputValue) ? inputValue : null;

    setErrors(null);
    setFields({
      ...fields,
      [fieldName]: { ...fields[fieldName], [key]: inputValue },
    });
  };

  const handleDeleteField = (fieldName: string) => {
    const onChangeValue = { ...fields };
    delete onChangeValue[fieldName];
    setErrors(null);
    setFields(onChangeValue);
  };

  return (
    <Box component="form" noValidate onSubmit={(event) => onSubmit(event)}>
      {Object.entries(fields).map(([key, value], index) => (
        <Box key={index} marginBottom={2}>
          <SensorField
            fieldName={key}
            fieldValue={value}
            index={index}
            sensorList={sensorList}
            showDeleteButton={getObjectKeys(fields).length > 1}
            showAddButton={index === getObjectKeys(fields).length - 1}
            handleAddField={handleAddField}
            handleDeleteField={handleDeleteField}
            handleSensorFieldChange={handleSensorFieldChange}
            handleMaxMinFieldChange={handleMaxMinFieldChange}
          />

          {errors ? (
            errors.map(
              (obj, index) =>
                obj.path.includes(key) && (
                  <Typography
                    key={index}
                    color="error"
                    fontSize={12}
                    paddingLeft={8}
                  >
                    {obj.message}
                  </Typography>
                )
            )
          ) : (
            <Typography color="info.main" fontSize={12} paddingLeft={8}>
              If limits are unspecified, the sensor's limits will be used as the
              default value.
            </Typography>
          )}
        </Box>
      ))}

      <Box
        sx={{
          position: "relative",
          marginTop: 2,
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-end",
        }}
      >
        <Button type="submit" disabled={isLoading}>
          Submit
        </Button>
        {isLoading && (
          <CircularProgress
            color="primary"
            size={30}
            thickness={5}
            sx={{
              position: "absolute",
              top: "50%",
              right: "5%",
              marginTop: "-12px",
              marginRight: "-12px",
            }}
          />
        )}
      </Box>
    </Box>
  );
}

export default AddIotDeviceSensorForm;
