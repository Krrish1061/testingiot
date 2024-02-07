import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import IotDeviceSensor from "../../entities/IotDeviceSensor";
import { ChangeEvent, useEffect, useState } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import CancelIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { IFormInputs } from "./SensorField";
import Sensor from "../../entities/Sensor";
import IconButton from "@mui/material/IconButton";
import { ZodIssue, ZodError } from "zod";
import DeviceSensorSchema from "./zodSchema/DeviceSensorSchema";
import MaxMinField from "./MaxMinField";
import SensorAutoComplete from "./SensorAutoComplete";
import CheckBox from "./CheckBox";
import useAddIotDeviceSensors from "../../hooks/iotDevice/useAddIotDeviceSensors";
import CircularProgress from "@mui/material/CircularProgress";
import useEditDeviceSensors from "../../hooks/iotDevice/useEditDeviceSensor";
import ErrorTableRow from "./ErrorTableRow";
import useDeleteDeviceSensor from "../../hooks/iotDevice/useDeleteDeviceSensor";

interface Props {
  iotDeviceId: number;
  iotDeviceSensors: IotDeviceSensor[];
}

// things to do
// 1. memorize the requiredformat and function and define hook for them
// 2. while updating check if the data is modified or not send request only when data is modified
// 3. improve the code and consideration for mobile devices and finally ui improvement.

const requiredFormat = (deviceSensors: IotDeviceSensor[]) => {
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

const getObjectKeys = (obj: IFormInputs) => Object.keys(obj);

const getMissingKeys = (fields: IFormInputs, newFields: IFormInputs | null) => {
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

function UpdateIotDeviceSensor({ iotDeviceId, iotDeviceSensors }: Props) {
  const {
    mutate: addDeviceSensors,
    isLoading: addLoading,
    isSuccess: addSuccess,
  } = useAddIotDeviceSensors(iotDeviceId);
  const {
    mutate: editDeviceSensors,
    isLoading: editLoading,
    isSuccess: editSuccess,
  } = useEditDeviceSensors(iotDeviceId);

  const {
    mutate: deleteDeviceSensors,
    isLoading: deleteLoading,
    isSuccess: deleteSuccess,
  } = useDeleteDeviceSensor(iotDeviceId);

  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [fields, setFields] = useState<IFormInputs>(
    requiredFormat(iotDeviceSensors)
  );
  const [newFields, setNewFields] = useState<IFormInputs | null>(null);
  const [errors, setErrors] = useState<ZodIssue[] | null>(null);
  const [deleteFieldName, setDeleteFieldName] = useState<string[] | null>(null);

  useEffect(() => {
    if (addSuccess) {
      setFields({ ...fields, ...newFields });
      setIsAddMode(false);
      setNewFields(null);
    }

    if (editSuccess) {
      setIsEditMode(false);
    }

    if (deleteSuccess) {
      const updatedObject = { ...fields };
      deleteFieldName?.forEach((key) => {
        if (key in updatedObject) {
          delete updatedObject[key];
        }
      });

      setFields(updatedObject);
      setIsDeleteMode(false);
      setDeleteFieldName(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addSuccess, editSuccess, deleteSuccess]);

  const handleAddEditSaveButton = () => {
    try {
      DeviceSensorSchema.parse({ ...fields, ...newFields });
      if (newFields && isAddMode) addDeviceSensors(newFields);
      if (isEditMode) editDeviceSensors(fields);
    } catch (err) {
      if (err instanceof ZodError) {
        setErrors(err.errors);
      }
    }
  };

  const handleDeletingSensor = () => {
    if (deleteFieldName) {
      deleteDeviceSensors(deleteFieldName);
    }
  };

  const handleAddClick = () => {
    const newFieldName = getMissingKeys(fields, newFields);
    setNewFields({
      [newFieldName]: { sensor_name: "", max_limit: null, min_limit: null },
    });
    setIsAddMode(true);
  };

  const handleSensorFieldChange = (data: Sensor | null, fieldName: string) => {
    setErrors(null);
    if (isAddMode && newFields) {
      setNewFields({
        ...newFields,
        [fieldName]: {
          ...newFields[fieldName],
          sensor_name: data?.name || "",
        },
      });
    } else if (isEditMode) {
      setFields({
        ...fields,
        [fieldName]: {
          ...fields[fieldName],
          sensor_name: data?.name || "",
        },
      });
    }
  };

  const handleMaxMinFieldChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    fieldName: string,
    key: "max_limit" | "min_limit"
  ) => {
    let inputValue: number | null = parseInt(event.target.value);
    inputValue = !isNaN(inputValue) ? inputValue : null;

    setErrors(null);
    if (isAddMode && newFields) {
      setNewFields({
        ...newFields,
        [fieldName]: { ...newFields[fieldName], [key]: inputValue },
      });
    } else if (isEditMode) {
      setFields({
        ...fields,
        [fieldName]: { ...fields[fieldName], [key]: inputValue },
      });
    }
  };

  const handleAddField = () => {
    const newFieldName = getMissingKeys(fields, newFields);
    setErrors(null);
    setNewFields({
      ...newFields,
      [newFieldName]: { sensor_name: "", max_limit: null, min_limit: null },
    });
  };

  const handleDeleteField = (fieldName: string) => {
    const onChangeValue = { ...newFields };
    delete onChangeValue[fieldName];
    setErrors(null);
    setNewFields(onChangeValue);
  };

  const handleCheckBoxChange = (isChecked: boolean, fieldName: string) => {
    if (isChecked) {
      if (deleteFieldName) {
        setDeleteFieldName([...deleteFieldName, fieldName]);
      } else {
        setDeleteFieldName([fieldName]);
      }
    } else {
      setDeleteFieldName(
        deleteFieldName?.filter((item) => item != fieldName) || null
      );
    }
  };

  return (
    <Paper elevation={0} sx={{ padding: 1 }}>
      <Typography component="h1" variant="h6" textAlign="center" gutterBottom>
        Sensor's associated with Iot-Device {iotDeviceId}
      </Typography>
      <Box>
        {!isEditMode && !isAddMode && !isDeleteMode ? (
          <Stack
            justifyContent="flex-end"
            alignItems="flex-end"
            direction="row"
          >
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddClick}
            >
              Add Sensor
            </Button>
            <Button
              size="small"
              color="secondary"
              startIcon={<EditIcon />}
              onClick={() => {
                setNewFields({});
                setIsEditMode(true);
              }}
            >
              Update Sensor
            </Button>
            <Button
              size="small"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setIsDeleteMode(true)}
            >
              Delete Sensor
            </Button>
          </Stack>
        ) : (
          <Stack
            justifyContent="flex-end"
            alignItems="flex-end"
            direction="row"
            sx={{ position: "relative" }}
          >
            <Button
              disabled={addLoading || editLoading || deleteLoading}
              size="small"
              color={isDeleteMode ? "error" : "primary"}
              onClick={() => {
                if (isAddMode || isEditMode) {
                  handleAddEditSaveButton();
                } else if (isDeleteMode) {
                  handleDeletingSensor();
                }
              }}
              startIcon={isDeleteMode ? <DeleteIcon /> : <SaveIcon />}
            >
              {isDeleteMode ? "Delete" : "Save"}
            </Button>
            {(addLoading || deleteLoading || editLoading) && (
              <CircularProgress
                color="primary"
                size={30}
                thickness={5}
                sx={{
                  position: "absolute",
                  top: "50%",
                  right: "10%",
                  marginTop: "-12px",
                  marginRight: "-12px",
                }}
              />
            )}

            <Button
              type="reset"
              size="small"
              disabled={addLoading || editLoading || deleteLoading}
              onClick={() => {
                setIsEditMode(false);
                setIsDeleteMode(false);
                setIsAddMode(false);
                setNewFields(null);
                setErrors(null);
                setDeleteFieldName(null);
              }}
              startIcon={<CancelIcon />}
            >
              Cancel
            </Button>
          </Stack>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 320 }} aria-label="Device Sensor table">
          <TableHead>
            <TableRow>
              <TableCell>S.N</TableCell>
              <TableCell>Field Name</TableCell>
              <TableCell>Sensor</TableCell>
              <TableCell>Max Limit</TableCell>
              <TableCell>Min Limit</TableCell>
              {isAddMode && <TableCell>Actions</TableCell>}
              {isDeleteMode && <TableCell>Select to Delete</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(fields).map(([fieldName, value], index) => (
              <>
                <TableRow
                  key={index}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                    "& > *": {
                      borderBottom: isEditMode && errors ? "unset" : undefined,
                    },
                  }}
                >
                  <TableCell component="th" scope="row">
                    {index + 1}
                  </TableCell>
                  <TableCell>{fieldName}</TableCell>

                  {!isEditMode ? (
                    <>
                      <TableCell>{value.sensor_name}</TableCell>
                      <TableCell>{value.max_limit ?? "-"}</TableCell>
                      <TableCell>{value.min_limit ?? "-"}</TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>
                        <SensorAutoComplete
                          id={`sensor${index + 1}`}
                          fieldName={fieldName}
                          sensorName={value.sensor_name}
                          handleSensorFieldChange={handleSensorFieldChange}
                        />
                      </TableCell>
                      <TableCell>
                        <MaxMinField
                          id={`max_limit${index + 1}`}
                          fieldName={fieldName}
                          name="max_limit"
                          value={value.max_limit}
                          handleMaxMinFieldChange={handleMaxMinFieldChange}
                        />
                      </TableCell>
                      <TableCell>
                        <MaxMinField
                          id={`min_limit${index + 1}`}
                          fieldName={fieldName}
                          name="min_limit"
                          value={value.min_limit}
                          handleMaxMinFieldChange={handleMaxMinFieldChange}
                        />
                      </TableCell>
                    </>
                  )}

                  {isAddMode && <TableCell>-</TableCell>}
                  {isDeleteMode && (
                    <TableCell>
                      <CheckBox
                        handleCheckBoxChange={handleCheckBoxChange}
                        fieldName={fieldName}
                      />
                    </TableCell>
                  )}
                </TableRow>
                <ErrorTableRow
                  key={fieldName}
                  errors={errors}
                  fieldName={fieldName}
                  isAddMode={isAddMode}
                  isEditMode={isEditMode}
                  newFields={null}
                />
              </>
            ))}
            {!!newFields &&
              Object.entries(newFields).map(([fieldName, value], index) => (
                <>
                  <TableRow
                    key={index}
                    sx={{
                      "& > *": {
                        borderBottom: newFields && "unset",
                      },
                    }}
                  >
                    <TableCell component="th" scope="row">
                      {iotDeviceSensors.length + index + 1}
                    </TableCell>
                    <TableCell>{fieldName}</TableCell>
                    <TableCell>
                      <SensorAutoComplete
                        id={`sensor${index + 1}`}
                        fieldName={fieldName}
                        sensorName={value.sensor_name}
                        handleSensorFieldChange={handleSensorFieldChange}
                      />
                    </TableCell>
                    <TableCell>
                      <MaxMinField
                        id={`max_limit${index + 1}`}
                        fieldName={fieldName}
                        name="max_limit"
                        value={value.max_limit}
                        handleMaxMinFieldChange={handleMaxMinFieldChange}
                      />
                    </TableCell>
                    <TableCell>
                      <MaxMinField
                        id={`min_limit${index + 1}`}
                        fieldName={fieldName}
                        name="min_limit"
                        value={value.min_limit}
                        handleMaxMinFieldChange={handleMaxMinFieldChange}
                      />
                    </TableCell>
                    {isAddMode && (
                      <TableCell>
                        <Stack direction="row" spacing={0}>
                          {getObjectKeys(newFields).length > 1 && (
                            <IconButton
                              onClick={() => handleDeleteField(fieldName)}
                            >
                              <DeleteIcon color="error" />
                            </IconButton>
                          )}
                          {index === getObjectKeys(newFields).length - 1 && (
                            <IconButton onClick={handleAddField}>
                              <AddIcon />
                            </IconButton>
                          )}
                        </Stack>
                      </TableCell>
                    )}
                  </TableRow>

                  <ErrorTableRow
                    errors={errors}
                    fieldName={fieldName}
                    isAddMode={isAddMode}
                    isEditMode={isEditMode}
                    newFields={newFields}
                  />
                </>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default UpdateIotDeviceSensor;
