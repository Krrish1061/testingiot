import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import InputLabel from "@mui/material/InputLabel";
import { ChangeEvent } from "react";

import TextField from "@mui/material/TextField";

interface Props {
  isEditMode: boolean;
  name: string;
  maxLimit: number | undefined;
  minLimit: number | undefined;
  handleMaxLimitChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleMinLimitChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

function SensorEditableField({
  isEditMode,
  name,
  maxLimit,
  minLimit,
  handleMaxLimitChange,
  handleMinLimitChange,
}: Props) {
  const maxLimitId = `max-limit-${name}`;
  const minLimitId = `min-limit-${name}`;

  return (
    <>
      <Stack
        marginTop={2}
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        spacing={2}
        paddingLeft={5}
      >
        <Typography
          component={isEditMode ? InputLabel : "div"}
          htmlFor={maxLimitId}
          sx={{ color: "inherit" }}
        >
          Max Limit:
        </Typography>
        {!isEditMode ? (
          <Typography>{maxLimit}</Typography>
        ) : (
          <TextField
            id={maxLimitId}
            value={maxLimit === null ? "" : maxLimit}
            type="number"
            variant="outlined"
            size="small"
            onChange={handleMaxLimitChange}
            sx={{ width: "15ch" }}
          />
        )}
      </Stack>

      <Stack
        marginTop={2}
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        spacing={2}
        paddingLeft={5}
      >
        <Typography
          component={isEditMode ? InputLabel : "div"}
          htmlFor={minLimitId}
          sx={{ color: "inherit" }}
        >
          Min Limit:
        </Typography>
        {!isEditMode ? (
          <Typography>{minLimit} </Typography>
        ) : (
          <TextField
            id={minLimitId}
            value={minLimit === null ? "" : minLimit}
            type="number"
            variant="outlined"
            size="small"
            onChange={handleMinLimitChange}
            sx={{ width: "15ch" }}
          />
        )}
      </Stack>
    </>
  );
}

export default SensorEditableField;
