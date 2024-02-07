import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Autocomplete from "@mui/material/Autocomplete";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import Sensor from "../../entities/Sensor";
import { ChangeEvent } from "react";
import Typography from "@mui/material/Typography";

export interface ISensorField {
  sensor_name: string;
  max_limit: number | null;
  min_limit: number | null;
}

export interface IFormInputs {
  [field_name: string]: ISensorField;
}

interface Props {
  fieldName: string;
  fieldValue: ISensorField;
  index: number;
  sensorList: Sensor[] | undefined;
  showDeleteButton: boolean;
  showAddButton: boolean;
  handleAddField: () => void;
  handleDeleteField: (fieldName: string) => void;
  handleSensorFieldChange: (data: Sensor | null, fieldName: string) => void;
  handleMaxMinFieldChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    fieldName: string,
    key: "max_limit" | "min_limit"
  ) => void;
}

function SensorField({
  fieldName,
  fieldValue,
  index,
  showDeleteButton,
  showAddButton,
  sensorList,
  handleAddField,
  handleDeleteField,
  handleSensorFieldChange,
  handleMaxMinFieldChange,
}: Props) {
  const { sensor_name, max_limit, min_limit } = fieldValue;
  const uniqueMaxLimitId = `max_limit${index + 1}`;
  const uniqueMinLimitId = `min_limit${index + 1}`;
  const uniqueSensorID = `sensor${index + 1}`;
  return (
    <Stack key={index} direction="row" alignItems="center" spacing={2}>
      <Stack
        key={index}
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        spacing={2}
      >
        <Typography>{fieldName}:</Typography>
        <Autocomplete
          id={uniqueSensorID}
          options={sensorList ?? []}
          getOptionLabel={(option) => option.name}
          value={sensorList?.find((item) => item.name === sensor_name) || null}
          onChange={(_, data) => handleSensorFieldChange(data, fieldName)}
          sx={{ width: 200 }}
          renderInput={(params) => (
            <TextField {...params} label="Choose a sensor" type="text" />
          )}
        />

        <TextField
          label="max_limit"
          id={uniqueMaxLimitId}
          type="number"
          value={max_limit === null ? "" : max_limit}
          onChange={(event) =>
            handleMaxMinFieldChange(event, fieldName, "max_limit")
          }
          autoComplete="off"
          sx={{ width: 100 }}
        />
        <TextField
          label="min_limit"
          id={uniqueMinLimitId}
          type="number"
          value={min_limit === null ? "" : min_limit}
          onChange={(event) =>
            handleMaxMinFieldChange(event, fieldName, "min_limit")
          }
          autoComplete="off"
          sx={{ width: 100 }}
        />
      </Stack>
      <Stack direction="row" spacing={0}>
        {showDeleteButton && (
          <IconButton onClick={() => handleDeleteField(fieldName)}>
            <DeleteIcon color="error" />
          </IconButton>
        )}
        {showAddButton && (
          <IconButton onClick={handleAddField}>
            <AddIcon />
          </IconButton>
        )}
      </Stack>
    </Stack>
  );
}

export default SensorField;
