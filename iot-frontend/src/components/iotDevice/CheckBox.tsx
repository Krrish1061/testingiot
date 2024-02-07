import Checkbox from "@mui/material/Checkbox";
import { ChangeEvent, useState } from "react";

interface Props {
  fieldName: string;
  handleCheckBoxChange: (isChecked: boolean, fieldName: string) => void;
}

function CheckBox({ handleCheckBoxChange, fieldName }: Props) {
  const [checked, setChecked] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
    handleCheckBoxChange(event.target.checked, fieldName);
  };

  return (
    <Checkbox
      color="secondary"
      checked={checked}
      onChange={handleChange}
      sx={{ padding: 0 }}
    />
  );
}

export default CheckBox;
