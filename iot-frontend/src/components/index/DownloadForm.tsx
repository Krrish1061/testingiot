import { zodResolver } from "@hookform/resolvers/zod";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grow from "@mui/material/Grow";
import InputLabel from "@mui/material/InputLabel";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";
import { Dispatch, RefObject, SetStateAction, useEffect, useMemo } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import UserGroups from "../../constants/userGroups";
import useGetAllCompany from "../../hooks/company/useGetAllCompany";
import useGetIotDeviceList from "../../hooks/download/useGetIotDeviceList";
import useGetSensorList from "../../hooks/download/useGetSensorList";
import useDownload from "../../hooks/sensorData/useDownload";
import useGetAllUser from "../../hooks/users/useGetAllUser";
import useAuthStore from "../../store/authStore";
import DownloadFormSchema, {
  IDownloadFormInputs,
} from "./ZodSchema/DownloadFormSchema";
const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  anchorRef: RefObject<HTMLButtonElement>;
}

function DownloadForm({ open, setOpen, anchorRef }: Props) {
  const user = useAuthStore((state) => state.user);
  const isuserSuperAdmin = user?.groups.includes(UserGroups.superAdminGroup);
  const { data: companyList } = useGetAllCompany(isuserSuperAdmin);
  const { data: userList } = useGetAllUser(isuserSuperAdmin);
  const { downloadSensorData, isLoading, setIsLoading } = useDownload();

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<IDownloadFormInputs>({
    resolver: zodResolver(DownloadFormSchema),
    defaultValues: {
      start_date: null,
      end_date: null,
      user: null,
      company: null,
      iot_device: "all",
      sensors: "all",
      file_type: "excel",
    },
  });

  const newIotDeviceList = useGetIotDeviceList({
    control: control,
    setValue: setValue,
  });

  const sensorNameList = useGetSensorList({
    control: control,
    iotDeviceList: newIotDeviceList,
    setValue: setValue,
  });

  const newCompanyList = useMemo(() => {
    const names = companyList
      ? [{ name: "all", slug: "all" }, ...companyList]
      : [];
    return names;
  }, [companyList]);

  const newUserList = useMemo(() => {
    const adminUserList =
      userList?.filter(
        (user) =>
          user.groups.includes(UserGroups.adminGroup) &&
          !user.is_associated_with_company
      ) || [];

    return [{ name: "all", username: "all", profile: null }, ...adminUserList];
  }, [userList]);

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const handleClose = (event: Event | React.SyntheticEvent) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }
    reset();
    setOpen(false);
  };

  const onSubmit: SubmitHandler<IDownloadFormInputs> = (data) => {
    setIsLoading(true);
    downloadSensorData(data);
  };

  const handleTodayClick = () => {
    clearErrors(["start_date", "end_date"]);
    const currentDate = dayjs().toDate();
    setValue("start_date", currentDate);
    setValue("end_date", currentDate);
  };

  const handleWeekClick = () => {
    clearErrors(["start_date", "end_date"]);
    const currentDate = dayjs().toDate();
    const oneWeekAgo = dayjs().subtract(1, "week").toDate();
    setValue("start_date", oneWeekAgo);
    setValue("end_date", currentDate);
  };

  const handleMonthClick = () => {
    clearErrors(["start_date", "end_date"]);
    const currentDate = dayjs().toDate();
    const oneMonthAgo = dayjs().subtract(30, "days").toDate();
    setValue("start_date", oneMonthAgo);
    setValue("end_date", currentDate);
  };

  const handleYearClick = () => {
    clearErrors(["start_date", "end_date"]);
    const currentDate = dayjs().toDate();
    const oneYearAgo = dayjs().subtract(1, "year").toDate();
    setValue("start_date", oneYearAgo);
    setValue("end_date", currentDate);
  };

  const handleAllClick = () => {
    clearErrors(["start_date", "end_date"]);
    const currentDate = dayjs().toDate();
    const startDate = dayjs("2000/01/01").toDate();
    setValue("start_date", startDate);
    setValue("end_date", currentDate);
  };

  const handleCancelClick = () => {
    reset();
    setOpen(false);
  };

  const handleDateChange = (
    newValue: dayjs.Dayjs | null,
    onChange: (value: Dayjs | null) => void
  ) => {
    const currentDate = dayjs();
    const oneMonthAgo = currentDate.subtract(1, "month");
    // Check if the newValue date is before one month
    if (!isuserSuperAdmin && newValue && newValue.isBefore(oneMonthAgo)) {
      newValue = oneMonthAgo;
    } else if (newValue && newValue.isAfter(currentDate)) {
      newValue = currentDate;
    }
    clearErrors(["start_date"]);
    onChange(newValue);
  };

  return (
    <Popper
      open={open}
      anchorEl={anchorRef.current}
      role={undefined}
      placement="bottom-start"
      transition
      sx={{ zIndex: 1200, width: { xs: 320, sm: 500 }, p: 1 }}
    >
      {({ TransitionProps }) => (
        <Grow
          {...TransitionProps}
          style={{
            transformOrigin: "right top",
          }}
        >
          <Paper elevation={12} sx={{ p: 2 }}>
            <ClickAwayListener onClickAway={handleClose}>
              <Box
                component="form"
                noValidate
                onSubmit={handleSubmit(onSubmit)}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-around"
                  spacing={{ xs: 2, sm: 4 }}
                >
                  <Stack
                    direction={{ xs: "row", sm: "column" }}
                    spacing={{ xs: 2, sm: 0 }}
                    alignItems={{ xs: "center", sm: "flex-start" }}
                  >
                    <Typography
                      component={InputLabel}
                      htmlFor="start_date"
                      gutterBottom
                      color="inherit"
                      fontWeight="bold"
                      sx={{ overflow: "visible" }}
                    >
                      Start Date:
                    </Typography>

                    <Controller
                      name="start_date"
                      control={control}
                      render={({ field }) => (
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            {...field}
                            format="YYYY-M-D"
                            minDate={
                              !isuserSuperAdmin
                                ? dayjs().subtract(1, "month")
                                : undefined
                            }
                            value={dayjs(field.value)}
                            onChange={(newValue) =>
                              handleDateChange(newValue, field.onChange)
                            }
                            disableFuture
                            slotProps={{
                              field: { clearable: true },
                              textField: {
                                id: "start_date",
                                size: "small",
                                variant: "outlined",
                                error: !!errors.start_date,
                                helperText: errors.start_date?.message,
                              },
                            }}
                            sx={{
                              maxWidth: "24ch",
                            }}
                          />
                        </LocalizationProvider>
                      )}
                    />
                  </Stack>
                  <Stack
                    direction={{ xs: "row", sm: "column" }}
                    spacing={{ xs: 3, sm: 0 }}
                    alignItems={{ xs: "center", sm: "flex-start" }}
                  >
                    <Typography
                      component={InputLabel}
                      htmlFor="end_date"
                      gutterBottom
                      color="inherit"
                      fontWeight="bold"
                      sx={{ overflow: "visible" }}
                    >
                      End Date:
                    </Typography>

                    <Controller
                      name="end_date"
                      control={control}
                      render={({ field }) => (
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            {...field}
                            format="YYYY-M-D"
                            minDate={
                              !isuserSuperAdmin
                                ? dayjs().subtract(1, "month")
                                : undefined
                            }
                            value={dayjs(field.value)}
                            onChange={(newValue) =>
                              handleDateChange(newValue, field.onChange)
                            }
                            disableFuture
                            slotProps={{
                              field: { clearable: true },
                              textField: {
                                id: "end_date",
                                size: "small",
                                variant: "outlined",
                                error: !!errors.end_date,
                                helperText: errors.end_date?.message,
                              },
                            }}
                            sx={{
                              maxWidth: "24ch",
                            }}
                          />
                        </LocalizationProvider>
                      )}
                    />
                  </Stack>
                </Stack>
                <Stack
                  direction="row"
                  spacing={1}
                  marginY={2}
                  justifyContent="space-evenly"
                >
                  <Chip
                    label="today"
                    variant="outlined"
                    clickable
                    size="small"
                    onClick={handleTodayClick}
                  />
                  <Chip
                    label="week"
                    variant="outlined"
                    clickable
                    size="small"
                    onClick={handleWeekClick}
                  />
                  <Chip
                    label="month"
                    variant="outlined"
                    clickable
                    size="small"
                    onClick={handleMonthClick}
                  />
                  {isuserSuperAdmin && (
                    <>
                      <Chip
                        label="year"
                        variant="outlined"
                        clickable
                        size="small"
                        onClick={handleYearClick}
                      />
                      <Chip
                        label="all"
                        variant="outlined"
                        clickable
                        size="small"
                        onClick={handleAllClick}
                      />
                    </>
                  )}
                </Stack>
                {isuserSuperAdmin && (
                  <>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      alignItems={{ xs: "flex-start", sm: "center" }}
                      spacing={{ xs: 1, sm: 2 }}
                      marginBottom={2}
                    >
                      <InputLabel
                        sx={{ color: "inherit", fontWeight: "bold" }}
                        htmlFor="user"
                      >
                        User:
                      </InputLabel>

                      <Controller
                        name="user"
                        control={control}
                        render={({ field }) => (
                          <Autocomplete
                            {...field}
                            disablePortal
                            disableCloseOnSelect
                            id="user"
                            multiple
                            options={newUserList}
                            getOptionLabel={(option) =>
                              option.profile?.first_name
                                ? `${option.profile?.first_name} ${option.profile?.last_name}`
                                : option.username
                            }
                            value={newUserList.filter((user) =>
                              field.value?.includes(user.username)
                            )}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                type="text"
                                error={!!errors.user}
                                helperText={errors.user?.message}
                              />
                            )}
                            renderOption={(props, option, { selected }) => (
                              <li {...props}>
                                <Checkbox
                                  icon={icon}
                                  id={option.username}
                                  checkedIcon={checkedIcon}
                                  style={{ marginRight: 8 }}
                                  checked={selected}
                                />
                                {option.profile?.first_name
                                  ? `${option.profile?.first_name} ${option.profile?.last_name}`
                                  : option.username}
                              </li>
                            )}
                            onChange={(_, data) => {
                              const newData = data.find(
                                (user) => user.username === "all"
                              )
                                ? "all"
                                : data.map(
                                    (user) =>
                                      typeof user !== "string" && user.username
                                  );
                              field.onChange(newData);
                            }}
                            sx={{
                              width: { xs: 1, sm: 350 },
                              marginLeft: { xs: 0, sm: 4 },
                            }}
                          />
                        )}
                      />
                    </Stack>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      alignItems={{ xs: "flex-start", sm: "center" }}
                      spacing={{ xs: 1, sm: 2 }}
                      marginBottom={2}
                    >
                      <InputLabel
                        sx={{ color: "inherit", fontWeight: "bold" }}
                        htmlFor="company"
                      >
                        Company:
                      </InputLabel>

                      <Controller
                        name="company"
                        control={control}
                        render={({ field }) => (
                          <Autocomplete
                            {...field}
                            disablePortal
                            disableCloseOnSelect
                            id="company"
                            multiple
                            options={newCompanyList}
                            getOptionLabel={(option) => option.name}
                            value={newCompanyList.filter((company) =>
                              field.value?.includes(company.slug)
                            )}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                type="text"
                                error={!!errors.company}
                                helperText={errors.company?.message}
                              />
                            )}
                            renderOption={(props, option, { selected }) => (
                              <li {...props}>
                                <Checkbox
                                  icon={icon}
                                  id={option.slug}
                                  checkedIcon={checkedIcon}
                                  style={{ marginRight: 8 }}
                                  checked={selected}
                                />
                                {option.name}
                              </li>
                            )}
                            onChange={(_, data) => {
                              const newData = data.find(
                                (company) => company.name === "all"
                              )
                                ? "all"
                                : data.map(
                                    (company) =>
                                      typeof company !== "string" &&
                                      company.slug
                                  );
                              field.onChange(newData);
                            }}
                            sx={{ width: { xs: 1, sm: 350 } }}
                          />
                        )}
                      />
                    </Stack>
                  </>
                )}
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={{ xs: 1, sm: 2 }}
                  marginBottom={2}
                >
                  <InputLabel
                    sx={{ color: "inherit", fontWeight: "bold" }}
                    htmlFor="iotDevice"
                  >
                    Iot Device:
                  </InputLabel>

                  <Controller
                    name="iot_device"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        {...field}
                        disablePortal
                        disableCloseOnSelect
                        id="iotDevice"
                        multiple
                        options={newIotDeviceList}
                        getOptionLabel={(option) =>
                          option.iot_device_details.name || option.id.toString()
                        }
                        value={newIotDeviceList.filter((iot_device) =>
                          field.value?.includes(iot_device.id.toString())
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            type="text"
                            error={!!errors.iot_device}
                            helperText={errors.iot_device?.message}
                          />
                        )}
                        renderOption={(props, option, { selected }) => (
                          <li {...props}>
                            <Checkbox
                              icon={icon}
                              id={`${option.id}-${option.iot_device_details.name}`}
                              checkedIcon={checkedIcon}
                              style={{ marginRight: 8 }}
                              checked={selected}
                            />
                            {option.iot_device_details.name || option.id}
                          </li>
                        )}
                        onChange={(_, data) => {
                          const newData = data.find(
                            (iot_device) => iot_device.id === "all"
                          )
                            ? "all"
                            : data.map(
                                (iot_device) =>
                                  typeof iot_device !== "string" &&
                                  iot_device.id.toString()
                              );
                          field.onChange(newData);
                        }}
                        sx={{ width: { xs: 1, sm: 350 } }}
                      />
                    )}
                  />
                </Stack>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={{ xs: 1, sm: 2 }}
                  marginBottom={2}
                >
                  <InputLabel
                    sx={{ color: "inherit", fontWeight: "bold" }}
                    htmlFor="sensors"
                  >
                    Sensors:
                  </InputLabel>

                  <Controller
                    name="sensors"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        {...field}
                        disablePortal
                        id="sensors"
                        disableCloseOnSelect
                        multiple
                        options={sensorNameList}
                        value={
                          sensorNameList.filter((sensor) =>
                            field.value?.includes(sensor)
                          )
                          // Array.isArray(field.value) ? field.value : ["all"]
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            type="text"
                            error={!!errors.sensors}
                            helperText={errors.sensors?.message}
                          />
                        )}
                        renderOption={(props, option, { selected }) => (
                          <li {...props}>
                            <Checkbox
                              icon={icon}
                              id={option}
                              checkedIcon={checkedIcon}
                              style={{ marginRight: 8 }}
                              checked={selected}
                            />
                            {option}
                          </li>
                        )}
                        onChange={(_, data) =>
                          data.includes("all")
                            ? field.onChange("all")
                            : field.onChange(data)
                        }
                        sx={{
                          width: { xs: 1, sm: 350 },
                          marginLeft: { xs: 0, sm: 1 },
                        }}
                      />
                    )}
                  />
                </Stack>

                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography gutterBottom color="inherit" fontWeight="bold">
                    File Type:
                  </Typography>

                  <Controller
                    name="file_type"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup {...field} row name="row-radio-file-type">
                        <FormControlLabel
                          value="excel"
                          control={<Radio />}
                          label="excel"
                        />
                        <FormControlLabel
                          value="csv"
                          control={<Radio />}
                          label="csv"
                        />
                      </RadioGroup>
                    )}
                  />
                </Stack>
                <Stack
                  direction="row"
                  justifyContent="flex-end"
                  sx={{ position: "relative" }}
                >
                  <Button
                    type="button"
                    disabled={isLoading}
                    onClick={handleCancelClick}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    Download
                  </Button>
                  {isLoading && (
                    <CircularProgress
                      color="primary"
                      size={30}
                      thickness={5}
                      sx={{
                        position: "absolute",
                        top: "50%",
                        right: "18%",
                        marginTop: "-12px",
                        marginRight: "-12px",
                      }}
                    />
                  )}
                </Stack>
              </Box>
            </ClickAwayListener>
          </Paper>
        </Grow>
      )}
    </Popper>
  );
}

export default DownloadForm;
