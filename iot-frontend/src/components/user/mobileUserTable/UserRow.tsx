import User from "../../../entities/User";
import { ChangeEvent, useState } from "react";
import ImageAvatar from "../../ImageAvatar";
import Collapse from "@mui/material/Collapse";
import Stack from "@mui/material/Stack";
import { SelectChangeEvent } from "@mui/material/Select";
import useAuthStore from "../../../store/authStore";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Box from "@mui/material/Box";
import useEditUser from "../../../hooks/users/useEditUser";
import useDeleteUser from "../../../hooks/users/useDeleteUser";
import MobileDeleteDialog from "../../mobileTable/MobileDeleteDialog";
import MobileConfirmDialog from "../../mobileTable/MobileConfirmDialog";
import MobileActions from "../../mobileTable/MobileActions";
import UserEditableField from "./UserEditableField";
import UserRowHeader from "./UserRowHeader";

interface Props {
  row: User;
}

function UserRow({ row }: Props) {
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [type, setType] = useState<string>(row.type);
  const [isActive, setIsActive] = useState<boolean>(row.is_active || false);
  const user = useAuthStore((state) => state.user);
  const { mutate: editUser } = useEditUser();
  const { mutate: deleteuser } = useDeleteUser();

  const handleDialogNoButton = () => {
    setDialogOpen(false);
  };

  const handleDialogYesButton = () => {
    editUser({ ...row, type: type, is_active: isActive });
    setDialogOpen(false);
    setIsEditMode(false);
    // setIsActive(row.is_active || false);
    // setType(row.type);
  };

  const handleDialogDeleteNoButton = () => {
    setDeleteDialogOpen(false);
  };
  const handleDialogDeleteButton = () => {
    deleteuser(row);
    setDeleteDialogOpen(false);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.readOnly) {
      setIsActive(event.target.checked);
    }
  };

  const handleTypeChange = (event: SelectChangeEvent) => {
    setType(event.target.value);
  };

  const isDisabled = row.id === user?.id;

  const handleSaveClick = () => {
    if (row.type !== type || row.is_active !== isActive) {
      setDialogOpen(true);
    } else {
      setIsEditMode(false);
    }
  };

  const handleDeleteClick = () => setDeleteDialogOpen(true);
  const handleEditClick = () => setIsEditMode(true);
  const handleCancelClick = () => {
    setIsActive(row.is_active || false);
    setType(row.type);
    setIsEditMode(false);
  };

  return (
    <>
      <TableRow
        sx={{ "& > *": { borderBottom: "unset" } }}
        onClick={() => setOpen(!open)}
      >
        <TableCell component="th" scope="row">
          <ImageAvatar
            imgUrl={row.profile?.profile_picture}
            altText={`${row.profile?.first_name} ${row?.profile?.last_name}`}
          />
        </TableCell>
        <TableCell>{row.username}</TableCell>
        <TableCell>{row.type}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              sx={{
                margin: 1,
              }}
            >
              <Stack direction="row" justifyContent="space-between">
                <UserRowHeader
                  fullName={` ${row.profile?.first_name} ${row.profile?.last_name}`}
                  email={row.email}
                  company={row.company}
                />
                <MobileActions
                  isDisabled={isDisabled}
                  isEditMode={isEditMode}
                  handleEditClick={handleEditClick}
                  handleSaveClick={handleSaveClick}
                  handleDeleteClick={handleDeleteClick}
                  handleCancelClick={handleCancelClick}
                />
              </Stack>

              <UserEditableField
                isEditMode={isEditMode}
                userType={row.type}
                username={row.username}
                type={type}
                isActive={isActive}
                handleChange={handleChange}
                handleTypeChange={handleTypeChange}
              />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
      <MobileConfirmDialog
        open={dialogOpen}
        name={`User ${row.username}`}
        handleNoButton={handleDialogNoButton}
        handleYesButton={handleDialogYesButton}
      />
      <MobileDeleteDialog
        name={`User ${row.username}`}
        open={deleteDialogOpen}
        handleNoButton={handleDialogDeleteNoButton}
        handleYesButton={handleDialogDeleteButton}
      />
    </>
  );
}

export default UserRow;
