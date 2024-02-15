import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";
import { FieldErrors, UseFormRegister } from "react-hook-form";

interface IFormInput {
  max_limit?: number | null;
  min_limit?: number | null;
}

interface Props {
  isEditMode: boolean;
  register: UseFormRegister<IFormInput>;
  errors: FieldErrors<IFormInput>;
  name: string;
  maxLimit: number | undefined;
  minLimit: number | undefined;
}

function SensorEditableField({
  isEditMode,
  name,
  maxLimit,
  minLimit,
  errors,
  register,
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
            inputProps={{
              ...register("max_limit"),
            }}
            id={maxLimitId}
            type="number"
            variant="outlined"
            size="small"
            sx={{ width: "15ch" }}
            error={!!errors.max_limit}
            helperText={errors.max_limit && errors.max_limit.message}
          />
        )}
      </Stack>

      <Stack
        marginY={2}
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
            inputProps={{
              ...register("min_limit"),
            }}
            type="number"
            variant="outlined"
            size="small"
            sx={{ width: "15ch" }}
            error={!!errors.min_limit}
            helperText={errors.min_limit && errors.min_limit.message}
          />
        )}
      </Stack>
    </>
  );
}

export default SensorEditableField;
