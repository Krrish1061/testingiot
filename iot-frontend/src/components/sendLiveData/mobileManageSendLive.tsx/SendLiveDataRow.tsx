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
import { useEffect, useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import SendLiveData from "../../../entities/SendLiveData";
import useGetAllCompany from "../../../hooks/company/useGetAllCompany";
import useDeleteSendLiveData from "../../../hooks/sendLiveData/useDeleteSendLiveData";
import useEditSendLiveData from "../../../hooks/sendLiveData/useEditSendLiveData";
import useGetAllUser from "../../../hooks/users/useGetAllUser";
import MobileActions from "../../mobileTable/MobileActions";
import MobileConfirmDialog from "../../mobileTable/MobileConfirmDialog";
import MobileDeleteDialog from "../../mobileTable/MobileDeleteDialog";

const schema = z.object({
  endpoint: z.string().min(1, "This field is required").url(),
});

type ISendLiveDataFormInputs = z.infer<typeof schema>;

interface Props {
  row: SendLiveData;
  index: number;
}

function SendLiveDataRow({ row, index }: Props) {
  const { data: companyList } = useGetAllCompany();
  const { data: userList } = useGetAllUser();
  const companyName = useMemo(
    () => companyList?.find((company) => company.slug === row.company),
    [row, companyList]
  )?.name;

  const user = useMemo(
    () => userList?.find((user) => user.username === row.user),
    [row, userList]
  );

  const userName = user?.profile?.first_name
    ? user.profile.first_name + " " + user.profile.last_name
    : user?.username;

  const [open, setOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm<ISendLiveDataFormInputs>({
    resolver: zodResolver(schema),
  });

  const { mutate: editSendLiveData, isSuccess: isEditSuccessful } =
    useEditSendLiveData();
  const { mutate: deleteSendLiveData } = useDeleteSendLiveData();
  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditSuccessful]);

  const onSubmit: SubmitHandler<ISendLiveDataFormInputs> = (data) => {
    if (data.endpoint !== row.endpoint) setDialogOpen(true);
    else setIsEditMode(false);
  };

  const handleDeleteClick = () => setDeleteDialogOpen(true);
  const handleEditClick = () => setIsEditMode(true);
  const handleCancelClick = () => {
    reset();
    setIsEditMode(false);
  };

  const handleDialogNoButton = () => {
    setDialogOpen(false);
  };

  const handleDialogYesButton = () => {
    const formData = getValues("endpoint");
    editSendLiveData({ ...row, endpoint: formData });
    setDialogOpen(false);
    setIsEditMode(false);
  };

  const handleDialogDeleteNoButton = () => {
    setDeleteDialogOpen(false);
  };

  const handleDialogDeleteButton = () => {
    deleteSendLiveData(row);
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
        <TableCell sx={{ paddingLeft: 1 }}>{companyName || "-"} </TableCell>
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
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              margin={1}
            >
              <Typography variant="h6" component="div">
                {row.user ? userName : companyName}
              </Typography>

              <MobileActions
                isEditMode={isEditMode}
                handleEditClick={handleEditClick}
                handleDeleteClick={handleDeleteClick}
                handleCancelClick={handleCancelClick}
              />
            </Stack>

            {!isEditMode ? (
              <Box paddingLeft={5}>
                <Typography gutterBottom color="inherit" fontWeight="bold">
                  Endpoint:
                </Typography>
                <Typography
                  color="inherit"
                  sx={{ wordBreak: "break-word", marginBottom: 1 }}
                >
                  {row.endpoint}
                </Typography>
              </Box>
            ) : (
              <Box paddingLeft={5} marginBottom={1}>
                <Typography
                  component={InputLabel}
                  htmlFor="endpoint"
                  fontWeight="bold"
                  gutterBottom
                  color="inherit"
                >
                  Endpoint:
                </Typography>
                <TextField
                  id="endpoint"
                  inputProps={{
                    ...register("endpoint"),
                  }}
                  type="text"
                  defaultValue={row.endpoint}
                  fullWidth
                  error={!!errors.endpoint}
                  helperText={errors.endpoint && errors.endpoint.message}
                  autoComplete="off"
                />
              </Box>
            )}
          </Collapse>
        </TableCell>
      </TableRow>
      <MobileConfirmDialog
        open={dialogOpen}
        name={`Endpoint associated with ${userName || companyName}`}
        handleNoButton={handleDialogNoButton}
        handleYesButton={handleDialogYesButton}
      />
      <MobileDeleteDialog
        name={`Endpoint associated with ${userName || companyName}`}
        open={deleteDialogOpen}
        handleNoButton={handleDialogDeleteNoButton}
        handleYesButton={handleDialogDeleteButton}
      />
    </>
  );
}

export default SendLiveDataRow;
