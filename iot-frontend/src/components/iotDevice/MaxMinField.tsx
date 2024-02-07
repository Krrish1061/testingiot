import TextField from "@mui/material/TextField";
import { ChangeEvent } from "react";

interface Props {
  id: string;
  fieldName: string;
  value: number | null;
  name: "max_limit" | "min_limit";
  handleMaxMinFieldChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    fieldName: string,
    key: "max_limit" | "min_limit"
  ) => void;
}

function MaxMinField({
  id,
  fieldName,
  name,
  value,
  handleMaxMinFieldChange,
}: Props) {
  const label = name === "max_limit" ? "max_limit" : "min_limit";
  return (
    <TextField
      label={label}
      size="small"
      id={id}
      type="number"
      value={value === null ? "" : value}
      onChange={(event) => handleMaxMinFieldChange(event, fieldName, label)}
      autoComplete="off"
      sx={{ width: 100 }}
    />
  );
}

export default MaxMinField;
