import { zodResolver } from "@hookform/resolvers/zod";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Collapse from "@mui/material/Collapse";
import Stack from "@mui/material/Stack";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import User from "../../../entities/User";
import useDeleteUser from "../../../hooks/users/useDeleteUser";
import useEditUser from "../../../hooks/users/useEditUser";
import useAuthStore from "../../../store/authStore";
import ImageAvatar from "../../ImageAvatar";
import MobileActions from "../../mobileTable/MobileActions";
import MobileConfirmDialog from "../../mobileTable/MobileConfirmDialog";
import MobileDeleteDialog from "../../mobileTable/MobileDeleteDialog";
import UserEditableField from "./UserEditableField";
import UserRowHeader from "./UserRowHeader";
import useGetAllCompany from "../../../hooks/company/useGetAllCompany";

interface Props {
  row: User;
  index: number;
}

const schema = z.object({
  type: z.enum(["ADMIN", "MODERATOR", "VIEWER", "SUPERADMIN"]),
  is_active: z.boolean(),
});

type IFormInputs = z.infer<typeof schema>;

function UserRow({ row, index }: Props) {
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const user = useAuthStore((state) => state.user);
  const isUserSuperAdmin = useAuthStore((state) => state.isUserSuperAdmin);
  const { mutate: editUser } = useEditUser();
  const { mutate: deleteuser } = useDeleteUser();
  const { data: companyList } = useGetAllCompany(isUserSuperAdmin);

  const companyName = useMemo(
    () => companyList?.find((company) => company.slug === row.company)?.name,
    [companyList, row]
  );

  const { handleSubmit, reset, control, getValues } = useForm<IFormInputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: row.type,
      is_active: row.is_active,
    },
  });

  const handleDialogNoButton = () => {
    setDialogOpen(false);
  };

  const handleDialogYesButton = () => {
    const formData = getValues();
    editUser({ ...row, type: formData.type, is_active: formData.is_active });
    setDialogOpen(false);
    setIsEditMode(false);
    reset();
  };

  const handleDialogDeleteNoButton = () => {
    setDeleteDialogOpen(false);
  };

  const handleDialogDeleteButton = () => {
    deleteuser(row);
    setDeleteDialogOpen(false);
  };

  const onSubmit: SubmitHandler<IFormInputs> = (data) => {
    if (row.type !== data.type || row.is_active !== data.is_active)
      setDialogOpen(true);
    else setIsEditMode(false);
  };

  const isDisabled = row.id === user?.id;

  const handleDeleteClick = () => setDeleteDialogOpen(true);
  const handleEditClick = () => setIsEditMode(true);
  const handleCancelClick = () => {
    reset();
    setIsEditMode(false);
  };

  const name = useMemo(
    () =>
      row?.profile?.first_name
        ? `${row?.profile?.first_name} ${row?.profile?.last_name}`
        : row?.username,
    [row]
  );

  return (
    <>
      <TableRow
        sx={{ "& > *": { borderBottom: "unset" } }}
        onClick={() => setOpen(!open)}
      >
        <TableCell size="small" sx={{ paddingLeft: 1, paddingRight: 0 }}>
          {open ? (
            <KeyboardArrowUpIcon />
          ) : (
            <KeyboardArrowDownIcon fontSize="small" />
          )}
        </TableCell>
        <TableCell
          component="th"
          scope="row"
          size="small"
          sx={{ paddingLeft: 1, paddingRight: 0 }}
        >
          {index + 1}
        </TableCell>
        <TableCell component="th" scope="row" sx={{ paddingRight: 1 }}>
          <ImageAvatar imgUrl={row.profile?.profile_picture} altText={name} />
        </TableCell>
        <TableCell sx={{ paddingX: 0 }}>{name}</TableCell>
        <TableCell sx={{ paddingX: 0 }}>{row.type}</TableCell>
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
              <UserRowHeader
                fullName={
                  row.profile?.first_name
                    ? `${row.profile.first_name} ${row.profile.last_name}`
                    : row.username
                }
                email={row.email}
                company={companyName}
              />
              <MobileActions
                isDisabled={isDisabled}
                isEditMode={isEditMode}
                handleEditClick={handleEditClick}
                handleDeleteClick={handleDeleteClick}
                handleCancelClick={handleCancelClick}
              />
            </Stack>

            <UserEditableField
              isEditMode={isEditMode}
              control={control}
              userType={row.type}
              username={row.username}
            />
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
