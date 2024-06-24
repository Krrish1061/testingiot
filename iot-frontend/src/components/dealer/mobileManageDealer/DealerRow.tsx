import { zodResolver } from "@hookform/resolvers/zod";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import InputLabel from "@mui/material/InputLabel";
import Stack from "@mui/material/Stack";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import IDealer from "../../../entities/Dealer";
import useDeleteDealer from "../../../hooks/dealer/useDeleteDealer";
import useUpdateDealer from "../../../hooks/dealer/useUpdateDealer";
import ImageAvatar from "../../ImageAvatar";
import MobileActions from "../../mobileTable/MobileActions";
import MobileConfirmDialog from "../../mobileTable/MobileConfirmDialog";
import MobileDeleteDialog from "../../mobileTable/MobileDeleteDialog";

interface Props {
  row: IDealer;
  index: number;
}

const schema = z.object({
  user_company_limit: z.coerce
    .string()
    .transform((value) => (value === "" ? null : Number(value)))
    .nullish()
    .refine((val) => !isNaN(val as number), { message: "Invalid Number" }),
});

type IDealerInputs = z.infer<typeof schema>;

function DealerRow({ row, index }: Props) {
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const { mutate: editdealer } = useUpdateDealer();
  const { mutate: deleteDealer } = useDeleteDealer();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm<IDealerInputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      user_company_limit: row.user_company_limit,
    },
  });

  const handleDialogNoButton = () => {
    setDialogOpen(false);
  };

  const handleDialogYesButton = () => {
    const user_company_limit = getValues("user_company_limit");
    editdealer({ ...row, user_company_limit: user_company_limit || null });
    setDialogOpen(false);
    setIsEditMode(false);
    reset();
  };

  const handleDialogDeleteNoButton = () => {
    setDeleteDialogOpen(false);
  };
  const handleDialogDeleteButton = () => {
    deleteDealer(row);
    setDeleteDialogOpen(false);
  };

  const companyUserLimitId = `user-company-limit-${row.slug}`;

  const handleDeleteClick = () => setDeleteDialogOpen(true);
  const handleEditClick = () => setIsEditMode(true);
  const handleCancelClick = () => {
    setIsEditMode(false);
    reset();
  };

  const onSubmit: SubmitHandler<IDealerInputs> = (data) => {
    if (row.user_company_limit !== data.user_company_limit) setDialogOpen(true);
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
          {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </TableCell>
        <TableCell
          component="th"
          scope="row"
          size="small"
          sx={{ paddingLeft: 1, paddingRight: 0 }}
        >
          {index + 1}
        </TableCell>
        <TableCell component="th" scope="row">
          <ImageAvatar imgUrl={row.profile?.logo} altText={row.name} />
        </TableCell>
        <TableCell>{row.name}</TableCell>
        <TableCell>{row.user_company_limit}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse
            in={open}
            timeout="auto"
            component={isEditMode ? "form" : "div"}
            onSubmit={handleSubmit(onSubmit)}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              margin={1}
            >
              <Box>
                <Typography variant="h6" component="div" marginBottom={0}>
                  {row.name}
                </Typography>
                <Typography paddingLeft={1} variant="body1" fontSize={14}>
                  {row.email}
                </Typography>
              </Box>
              <MobileActions
                isEditMode={isEditMode}
                handleEditClick={handleEditClick}
                handleDeleteClick={handleDeleteClick}
                handleCancelClick={handleCancelClick}
              />
            </Stack>

            <Stack
              direction="row"
              justifyContent="flex-start"
              alignItems="center"
              spacing={2}
              paddingLeft={5}
              marginY={2}
            >
              <Typography
                component={isEditMode ? InputLabel : "div"}
                htmlFor={companyUserLimitId}
                sx={{ color: "inherit" }}
              >
                User Limit:
              </Typography>

              {!isEditMode ? (
                <Typography>{row.user_company_limit}</Typography>
              ) : (
                <TextField
                  inputProps={{
                    ...register("user_company_limit"),
                    min: 0,
                  }}
                  id={companyUserLimitId}
                  type="number"
                  variant="outlined"
                  size="small"
                  error={!!errors.user_company_limit}
                  helperText={
                    errors.user_company_limit &&
                    errors.user_company_limit.message
                  }
                  sx={{ width: 100 }}
                />
              )}
            </Stack>
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
        name={`Dealer ${row.name}`}
        open={deleteDialogOpen}
        handleNoButton={handleDialogDeleteNoButton}
        handleYesButton={handleDialogDeleteButton}
      />
    </>
  );
}

export default DealerRow;
