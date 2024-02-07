import Autocomplete from "@mui/material/Autocomplete";
import useGetAllSensors from "../../hooks/sensor/useGetAllSensors";
import TextField from "@mui/material/TextField";
import Sensor from "../../entities/Sensor";

interface Props {
  id: string;
  fieldName: string;
  sensorName: string;
  handleSensorFieldChange: (data: Sensor | null, fieldName: string) => void;
}

function SensorAutoComplete({
  id,
  fieldName,
  sensorName,
  handleSensorFieldChange,
}: Props) {
  const { data: sensorList } = useGetAllSensors();
  return (
    <Autocomplete
      size="small"
      id={id}
      options={sensorList ?? []}
      getOptionLabel={(option) => option.name}
      value={sensorList?.find((item) => item.name === sensorName) || null}
      onChange={(_, data) => handleSensorFieldChange(data, fieldName)}
      sx={{ width: 200 }}
      renderInput={(params) => (
        <TextField {...params} label="Choose a sensor" type="text" />
      )}
    />
  );
}

export default SensorAutoComplete;
