import { zodResolver } from "@hookform/resolvers/zod";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Collapse from "@mui/material/Collapse";
import Stack from "@mui/material/Stack";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import IotDevice from "../../../entities/IotDevice";
import useGetAllCompany from "../../../hooks/company/useGetAllCompany";
import useDeleteIotDevice from "../../../hooks/iotDevice/useDeleteIotDevice";
import useUpdateIotDevice from "../../../hooks/iotDevice/useUpdateIotDevice";
import useGetAllUser from "../../../hooks/users/useGetAllUser";
import MobileActions from "../../mobileTable/MobileActions";
import MobileConfirmDialog from "../../mobileTable/MobileConfirmDialog";
import MobileDeleteDialog from "../../mobileTable/MobileDeleteDialog";
import iotDeviceschema, {
  IDeviceFormInputs,
} from "../zodSchema/IotDeviceSchema";
import IotDeviceEditableField from "./IotDeviceEditableField";

interface Props {
  row: IotDevice;
  index: number;
}

function IotDeviceRow({ row, index }: Props) {
  const [open, setOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { mutate: updateIotDevice } = useUpdateIotDevice();
  const { mutate: deleteIotDevice } = useDeleteIotDevice();
  const { data: companyList } = useGetAllCompany();
  const { data: userList } = useGetAllUser();

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
  const userName =
    firstName && lastName ? `${firstName} ${lastName}` : row.user;

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
    getValues,
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
    } else {
      setIsEditMode(false);
    }
  };

  const handleDialogNoButton = () => {
    setDialogOpen(false);
  };

  const handleDialogYesButton = () => {
    const formData = getValues();
    updateIotDevice({
      ...row,
      board_id: formData.board_id,
      is_active: formData.is_active,
      user: formData.user,
      company: formData.company,
    });
    setDialogOpen(false);
    setIsEditMode(false);
  };

  const handleDialogDeleteNoButton = () => {
    setDeleteDialogOpen(false);
  };

  const handleDialogDeleteButton = () => {
    deleteIotDevice(row);
    setDeleteDialogOpen(false);
  };

  const handleDeleteClick = () => setDeleteDialogOpen(true);
  const handleEditClick = () => setIsEditMode(true);
  const handleCancelClick = () => {
    reset();
    setIsEditMode(false);
    setDeleteDialogOpen(false);
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
          {row.iot_device_details?.name || "-"}
        </TableCell>
        <TableCell>{companyName || "-"} </TableCell>
        <TableCell>{userName || "-"} </TableCell>
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
                Iot-Device {row.iot_device_details?.name}
              </Typography>

              <MobileActions
                isEditMode={isEditMode}
                handleEditClick={handleEditClick}
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
