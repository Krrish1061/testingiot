import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Stack from "@mui/material/Stack";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";
import IotDevice from "../../../entities/IotDevice";
import MobileActions from "../../mobileTable/MobileActions";
import MobileConfirmDialog from "../../mobileTable/MobileConfirmDialog";
import MobileDeleteDialog from "../../mobileTable/MobileDeleteDialog";
import IotDeviceEditableField from "./IotDeviceEditableField";

import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import useGetAllCompany from "../../../hooks/company/useGetAllCompany";
import useGetAllUser from "../../../hooks/users/useGetAllUser";
import iotDeviceschema, {
  IDeviceFormInputs,
} from "../zodSchema/IotDeviceSchema";
import useUpdateIotDevice from "../../../hooks/iotDevice/useUpdateIotDevice";
import useDeleteIotDevice from "../../../hooks/iotDevice/useDeleteIotDevice";

interface Props {
  row: IotDevice;
}

function IotDeviceRow({ row }: Props) {
  const { data: companyList } = useGetAllCompany();
  const { data: userList } = useGetAllUser();
  const [open, setOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<IDeviceFormInputs | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { mutate: updateIotDevice } = useUpdateIotDevice();
  const { mutate: deleteIotDevice } = useDeleteIotDevice();

  const defaultsValues = {
    user: row.user,
    company: row.company,
    board_id: row.board_id,
    is_active: row.is_active,
  };

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<IDeviceFormInputs>({
    resolver: zodResolver(iotDeviceschema),
    defaultValues: defaultsValues,
  });

  const onSubmit: SubmitHandler<IDeviceFormInputs> = (data) => {
    if (
      !!row.user !== !!data.user ||
      !!row.company !== !!data.company ||
      row.board_id !== data.board_id ||
      row.is_active !== data.is_active
    ) {
      setDialogOpen(true);
      setFormData(data);
    } else {
      setIsEditMode(false);
    }
  };

  const handleDialogNoButton = () => {
    setDialogOpen(false);
    setFormData(null);
  };

  const handleDialogYesButton = () => {
    if (formData) {
      updateIotDevice({
        ...row,
        board_id: formData.board_id,
        is_active: formData.is_active,
        user: formData.user,
        company: formData.company,
      });
    }

    setDialogOpen(false);
    setIsEditMode(false);
    setFormData(null);
  };

  const handleDialogDeleteNoButton = () => {
    setDeleteDialogOpen(false);
  };

  const handleDialogDeleteButton = () => {
    deleteIotDevice(row);
    setDeleteDialogOpen(false);
  };

  const handleSaveClick = () => {
    handleSubmit(onSubmit)();
  };

  const handleDeleteClick = () => setDeleteDialogOpen(true);
  const handleEditClick = () => setIsEditMode(true);
  const handleCancelClick = () => {
    reset();
    setIsEditMode(false);
    setDeleteDialogOpen(false);
  };

  const companyName = useMemo(
    () => companyList?.find((company) => company.slug === row.company)?.name,
    [companyList, row]
  );

  const user = useMemo(
    () => userList?.find((user) => user.username === row.user),
    [userList, row]
  );

  const firstName = user?.profile?.first_name;
  const lastName = user?.profile?.last_name;
  const userName = firstName && lastName ? `${firstName} ${lastName}` : null;

  return (
    <>
      <TableRow
        sx={{ "& > *": { borderBottom: "unset" } }}
        onClick={() => setOpen(!open)}
      >
        <TableCell component="th" scope="row">
          {row.id}
        </TableCell>
        <TableCell>{companyName || "-"} </TableCell>
        <TableCell>{userName || row.user || "-"} </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              sx={{
                margin: 1,
              }}
              component="form"
              noValidate
              onSubmit={handleSubmit(onSubmit)}
            >
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="h6" component="div" marginBottom={0}>
                  Iot-Device {row.id}
                </Typography>

                <MobileActions
                  isEditMode={isEditMode}
                  handleEditClick={handleEditClick}
                  handleSaveClick={handleSaveClick}
                  handleDeleteClick={handleDeleteClick}
                  handleCancelClick={handleCancelClick}
                />
              </Stack>
              <IotDeviceEditableField
                isEditMode={isEditMode}
                register={register}
                iotDevice={row}
                control={control}
                errors={errors}
                userList={userList}
                companyList={companyList}
                companyName={companyName}
                userName={userName || row.user}
              />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
      <MobileConfirmDialog
        open={dialogOpen}
        name={`Iot Device ${row.id}`}
        handleNoButton={handleDialogNoButton}
        handleYesButton={handleDialogYesButton}
      />
      <MobileDeleteDialog
        name={`IotDevice ${row.id}`}
        open={deleteDialogOpen}
        handleNoButton={handleDialogDeleteNoButton}
        handleYesButton={handleDialogDeleteButton}
      />
    </>
  );
}

export default IotDeviceRow;
