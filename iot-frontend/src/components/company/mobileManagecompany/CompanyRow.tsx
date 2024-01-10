import { ChangeEvent, useState } from "react";
import Company from "../../../entities/Company";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import ImageAvatar from "../../ImageAvatar";
import Collapse from "@mui/material/Collapse";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import InputLabel from "@mui/material/InputLabel";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import useEditCompany from "../../../hooks/company/useEditCompany";
import useDeleteCompany from "../../../hooks/company/useDeleteCompany";
import MobileConfirmDialog from "../../mobileTable/MobileConfirmDialog";
import MobileDeleteDialog from "../../mobileTable/MobileDeleteDialog";
import MobileActions from "../../mobileTable/MobileActions";

interface Props {
  row: Company;
}

function CompanyRow({ row }: Props) {
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [userLimit, setUserLimit] = useState(row.user_limit);

  const { mutate: editCompany } = useEditCompany();
  const { mutate: deleteCompany } = useDeleteCompany();

  const handleDialogNoButton = () => {
    setDialogOpen(false);
  };

  const handleDialogYesButton = () => {
    editCompany({ ...row, user_limit: userLimit });
    setDialogOpen(false);
    setIsEditMode(false);
  };

  const handleDialogDeleteNoButton = () => {
    setDeleteDialogOpen(false);
  };
  const handleDialogDeleteButton = () => {
    deleteCompany(row);
    setDeleteDialogOpen(false);
  };

  const companyUserLimitId = `user-limit-${row.slug}`;

  const handleSaveClick = () => {
    if (row.user_limit !== userLimit) setDialogOpen(true);
    else setIsEditMode(false);
  };

  const handleDeleteClick = () => setDeleteDialogOpen(true);
  const handleEditClick = () => setIsEditMode(true);
  const handleCancelClick = () => {
    setIsEditMode(false);
    setUserLimit(row.user_limit);
  };

  return (
    <>
      <TableRow
        sx={{ "& > *": { borderBottom: "unset" } }}
        onClick={() => setOpen(!open)}
      >
        <TableCell component="th" scope="row">
          <ImageAvatar imgUrl={row.profile?.logo} altText={row.name} />
        </TableCell>
        <TableCell>{row.name}</TableCell>
        <TableCell>{row.user_limit}</TableCell>
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
                    {row.name}
                  </Typography>
                  <Typography paddingLeft={1} variant="body1" fontSize={14}>
                    {row.email}
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
                  <Typography>{row.user_limit} </Typography>
                ) : (
                  <TextField
                    id={companyUserLimitId}
                    value={userLimit}
                    type="number"
                    variant="outlined"
                    size="small"
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      setUserLimit(parseInt(event.target.value));
                    }}
                    inputProps={{ min: 0 }}
                  />
                )}
              </Stack>
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

export default CompanyRow;
