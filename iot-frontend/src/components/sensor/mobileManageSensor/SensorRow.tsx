import { useState } from "react";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Collapse from "@mui/material/Collapse";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import MobileConfirmDialog from "../../mobileTable/MobileConfirmDialog";
import MobileDeleteDialog from "../../mobileTable/MobileDeleteDialog";
import MobileActions from "../../mobileTable/MobileActions";
import Sensor from "../../../entities/Sensor";
import SensorEditableField from "./SensorEditableField";
import useEditSensor from "../../../hooks/sensor/useEditSensor";
import useDeleteSensor from "../../../hooks/sensor/useDeleteSensor";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { SubmitHandler, useForm } from "react-hook-form";

interface Props {
  row: Sensor;
  index: number;
}

const schema = z
  .object({
    max_limit: z.coerce
      .string()
      .transform((value) => (value === "" ? null : Number(value)))
      .nullish()
      .refine((val) => !isNaN(val as number), { message: "Invalid Number" }),
    min_limit: z.coerce
      .string()
      .transform((value) => (value === "" ? null : Number(value)))
      .nullish()
      .refine((val) => !isNaN(val as number), { message: "Invalid Number" }),
  })
  .superRefine((data, ctx) => {
    if (data.max_limit && data.min_limit && data.max_limit <= data.min_limit) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "The maximum limit must be greater than the minimum limit, and vice versa.",
        path: ["max_limit"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "The maximum limit must be greater than the minimum limit, and vice versa.",
        path: ["min_limit"],
      });
    }
  });

type IFormInputs = z.infer<typeof schema>;

function SensorRow({ row, index }: Props) {
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const { mutateAsync: editSensor } = useEditSensor();
  const { mutate: deleteSensor } = useDeleteSensor();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm<IFormInputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      max_limit: row.max_limit,
      min_limit: row.min_limit,
    },
  });

  const handleDialogNoButton = () => {
    setDialogOpen(false);
  };

  const handleDialogYesButton = () => {
    const formData = getValues();
    editSensor({
      ...row,
      max_limit: formData.max_limit || undefined,
      min_limit: formData.min_limit || undefined,
    });
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

  const handleDeleteClick = () => setDeleteDialogOpen(true);
  const handleEditClick = () => setIsEditMode(true);
  const handleCancelClick = () => {
    reset();
    setIsEditMode(false);
  };

  const onSubmit: SubmitHandler<IFormInputs> = (data) => {
    if (row.max_limit !== data.max_limit || row.min_limit !== data.min_limit)
      setDialogOpen(true);
    else setIsEditMode(false);
  };

  const handleRowOpenClose = () => {
    setOpen(!open);
    if (isEditMode) {
      setIsEditMode(false);
      reset();
    }
  };

  return (
    <>
      <TableRow
        sx={{ "& > *": { borderBottom: "unset" } }}
        onClick={handleRowOpenClose}
      >
        <TableCell size="small" sx={{ paddingLeft: 1, paddingRight: 0 }}>
          {open ? (
            <KeyboardArrowUpIcon fontSize="small" />
          ) : (
            <KeyboardArrowDownIcon fontSize="small" />
          )}
        </TableCell>
        <TableCell size="small" sx={{ paddingLeft: 1, paddingRight: 0 }}>
          {index + 1}
        </TableCell>

        <TableCell component="th" scope="row" sx={{ paddingLeft: 1 }}>
          {row.name}
        </TableCell>
        <TableCell>{row.symbol || "-"} </TableCell>
        <TableCell>{row.unit || "-"} </TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ paddingY: 0 }} colSpan={6}>
          <Collapse
            in={open}
            timeout="auto"
            component={isEditMode ? "form" : "div"}
            onSubmit={handleSubmit(onSubmit)}
          >
            <Stack direction="row" justifyContent="space-between" margin={1}>
              <Typography variant="h6" component="div" marginBottom={0}>
                {row.name.charAt(0).toUpperCase() + row.name.slice(1)}
              </Typography>

              <MobileActions
                isEditMode={isEditMode}
                handleEditClick={handleEditClick}
                handleDeleteClick={handleDeleteClick}
                handleCancelClick={handleCancelClick}
              />
            </Stack>

            <SensorEditableField
              isEditMode={isEditMode}
              register={register}
              errors={errors}
              name={row.name}
              maxLimit={row.max_limit}
              minLimit={row.min_limit}
            />
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
