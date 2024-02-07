import { ChangeEvent, useState } from "react";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Collapse from "@mui/material/Collapse";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import MobileConfirmDialog from "../../mobileTable/MobileConfirmDialog";
import MobileDeleteDialog from "../../mobileTable/MobileDeleteDialog";
import MobileActions from "../../mobileTable/MobileActions";
import Sensor from "../../../entities/Sensor";
import SensorEditableField from "./SensorEditableField";
import useEditSensor from "../../../hooks/sensor/useEditSensor";
import useDeleteSensor from "../../../hooks/sensor/useDeleteSensor";

interface Props {
  row: Sensor;
}

function SensorRow({ row }: Props) {
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [maxLimit, setMaxLimit] = useState(row.max_limit);
  const [minLimit, setMinLimit] = useState(row.min_limit);
  const { mutateAsync: editSensor } = useEditSensor();
  const { mutate: deleteSensor } = useDeleteSensor();

  const handleDialogNoButton = () => {
    setDialogOpen(false);
  };

  const handleDialogYesButton = () => {
    editSensor({ ...row, max_limit: maxLimit, min_limit: minLimit });
    setDialogOpen(false);
    setIsEditMode(false);
  };

  const handleDialogDeleteNoButton = () => {
    setDeleteDialogOpen(false);
  };

  const handleDialogDeleteButton = () => {
    deleteSensor(row);
    setDeleteDialogOpen(false);
  };

  const handleSaveClick = () => {
    if (row.max_limit !== maxLimit || row.min_limit !== minLimit)
      setDialogOpen(true);
    else setIsEditMode(false);
  };

  const handleDeleteClick = () => setDeleteDialogOpen(true);
  const handleEditClick = () => setIsEditMode(true);
  const handleCancelClick = () => {
    setIsEditMode(false);
    setMaxLimit(row.max_limit);
    setMinLimit(row.min_limit);
  };

  const handleMaxLimitChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = parseInt(event.target.value);
    if (!isNaN(inputValue)) {
      setMaxLimit(inputValue);
    }
  };

  const handleMinLimitChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = parseInt(event.target.value);
    if (!isNaN(inputValue)) {
      setMinLimit(inputValue);
    }
  };

  return (
    <>
      <TableRow
        sx={{ "& > *": { borderBottom: "unset" } }}
        onClick={() => setOpen(!open)}
      >
        <TableCell component="th" scope="row">
          {row.name}
        </TableCell>
        <TableCell>{row.symbol || "-"} </TableCell>
        <TableCell>{row.unit || "-"} </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              sx={{
                margin: 1,
              }}
            >
              <Stack direction="row" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" component="div" marginBottom={0}>
                    {row.name.charAt(0).toUpperCase() + row.name.slice(1)}
                  </Typography>
                </Box>
                <MobileActions
                  isEditMode={isEditMode}
                  handleEditClick={handleEditClick}
                  handleSaveClick={handleSaveClick}
                  handleDeleteClick={handleDeleteClick}
                  handleCancelClick={handleCancelClick}
                />
              </Stack>

              <SensorEditableField
                isEditMode={isEditMode}
                name={row.name}
                maxLimit={maxLimit}
                minLimit={minLimit}
                handleMaxLimitChange={handleMaxLimitChange}
                handleMinLimitChange={handleMinLimitChange}
              />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
      <MobileConfirmDialog
        open={dialogOpen}
        name={row.name}
        handleNoButton={handleDialogNoButton}
        handleYesButton={handleDialogYesButton}
      />
      <MobileDeleteDialog
        name={`Company ${row.name}`}
        open={deleteDialogOpen}
        handleNoButton={handleDialogDeleteNoButton}
        handleYesButton={handleDialogDeleteButton}
      />
    </>
  );
}

export default SensorRow;
