import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { ZodIssue } from "zod";
import { IFormInputs } from "./SensorField";

interface Props {
  errors: ZodIssue[] | null;
  fieldName: string;
  isEditMode: boolean;
  isAddMode: boolean;
  newFields: IFormInputs | null;
}

function ErrorTableRow({
  fieldName,
  errors,
  isAddMode,
  isEditMode,
  newFields,
}: Props) {
  const errorcell = (
    <TableCell colSpan={6} sx={{ m: 0, p: 0 }}>
      {errors?.map(
        (obj, index) =>
          obj.path.includes(fieldName) && (
            <Typography
              key={index}
              color="error"
              fontSize={12}
              paddingLeft={2}
              marginTop={-1.5}
              marginBottom={1.5}
            >
              {obj.message}
            </Typography>
          )
      )}
    </TableCell>
  );

  const infocell = (
    <TableCell colSpan={6} sx={{ m: 0, p: 0 }}>
      <Typography
        color="info.main"
        fontSize={12}
        paddingLeft={2}
        marginTop={-1.5}
      >
        If limits are unspecified, the sensor's limits will be used as the
        default value.
      </Typography>
    </TableCell>
  );

  if (isEditMode) {
    return errors ? (
      <TableRow
        sx={{
          m: 0,
          p: 0,
        }}
      >
        <TableCell sx={{ m: 0, p: 0 }}></TableCell>
        <TableCell sx={{ m: 0, p: 0 }}></TableCell>
        {errorcell}
      </TableRow>
    ) : null;
  }
  if (isAddMode && newFields) {
    return (
      <TableRow
        sx={{
          m: 0,
          p: 0,
        }}
      >
        <TableCell sx={{ m: 0, p: 0 }}></TableCell>
        <TableCell sx={{ m: 0, p: 0 }}></TableCell>
        {errors ? errorcell : fieldName in newFields ? infocell : null}
      </TableRow>
    );
  }

  return null;
}

export default ErrorTableRow;
