import { zodResolver } from "@hookform/resolvers/zod";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import InputLabel from "@mui/material/InputLabel";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Dispatch, SetStateAction, useEffect } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import UserGroups from "../../constants/userGroups";
import IotDevice from "../../entities/IotDevice";
import useGetAllCompany from "../../hooks/company/useGetAllCompany";
import useGetAllDealer from "../../hooks/dealer/useGetAllDealer";
import useAddIotDevice from "../../hooks/iotDevice/useAddIotDevice";
import useGetAllUser from "../../hooks/users/useGetAllUser";
import iotDeviceschema, {
  IDeviceFormInputs,
} from "./zodSchema/IotDeviceSchema";

interface Props {
  handleNext: () => void;
  setIotDevice: Dispatch<SetStateAction<IotDevice>>;
}

function AddIotDeviceForm({ handleNext, setIotDevice }: Props) {
  const { data: companyList } = useGetAllCompany();
  const { data: dealerList } = useGetAllDealer();
  const { data: UserList } = useGetAllUser();
  const { data: iotDevice, mutate, isSuccess, isLoading } = useAddIotDevice();
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
    clearErrors,
  } = useForm<IDeviceFormInputs>({
    resolver: zodResolver(iotDeviceschema),
    defaultValues: {
      user: null,
      company: null,
      dealer: null,
      board_id: null,
      is_active: true,
    },
  });

  const onSubmit: SubmitHandler<IDeviceFormInputs> = (data) => {
    mutate(data);
  };

  useEffect(() => {
    if (isSuccess) {
      setIotDevice(iotDevice);
      reset();
      handleNext();
    }
  }, [isSuccess, handleNext, reset, iotDevice, setIotDevice]);

  return (
    <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
      <Box marginBottom={2}>
        <InputLabel sx={{ color: "inherit" }} htmlFor="user">
          User
        </InputLabel>

        <Controller
          name="user"
          control={control}
          render={({ field }) => (
            <Autocomplete
              {...field}
              id="user"
              options={
                UserList?.filter(
                  (user) =>
                    user.groups.includes(UserGroups.adminGroup) &&
                    !user.is_associated_with_company
                ) ?? []
              }
              getOptionLabel={(option) =>
                option.profile?.first_name
                  ? `${option.profile?.first_name} ${option.profile?.last_name}`
                  : option.username
              }
              value={
                UserList?.find((item) => field.value === item.username) || null
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  type="text"
                  error={!!errors.user}
                  helperText={errors.user?.message}
                />
              )}
              onChange={(_, data) => {
                clearErrors();
                field.onChange(data?.username);
              }}
            />
          )}
        />
      </Box>

      <Box marginBottom={2}>
        <InputLabel sx={{ color: "inherit" }} htmlFor="company">
          Company:
        </InputLabel>

        <Controller
          name="company"
          control={control}
          render={({ field }) => (
            <Autocomplete
              {...field}
              id="company"
              options={companyList ?? []}
              getOptionLabel={(option) => option.name}
              value={
                companyList?.find((item) => field.value === item.slug) || null
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  type="text"
                  error={!!errors.company}
                  helperText={errors.company?.message}
                />
              )}
              onChange={(_, data) => {
                clearErrors();
                field.onChange(data?.slug);
              }}
            />
          )}
        />
      </Box>
      <Box marginBottom={2}>
        <InputLabel sx={{ color: "inherit" }} htmlFor="company">
          Dealer:
        </InputLabel>

        <Controller
          name="dealer"
          control={control}
          render={({ field }) => (
            <Autocomplete
              {...field}
              id="dealer"
              options={dealerList ?? []}
              getOptionLabel={(option) => option.name}
              value={
                dealerList?.find((item) => field.value === item.slug) || null
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  type="text"
                  error={!!errors.dealer}
                  helperText={errors.dealer?.message}
                />
              )}
              onChange={(_, data) => {
                clearErrors();
                field.onChange(data?.slug);
              }}
            />
          )}
        />
      </Box>
      <Box marginBottom={2}>
        <Typography
          component={InputLabel}
          htmlFor="board_id"
          gutterBottom
          color="inherit"
        >
          Board Id:
        </Typography>
        <TextField
          inputProps={{
            ...register("board_id"),
          }}
          id="board_id"
          type="number"
          fullWidth
          error={!!errors.board_id}
          helperText={errors.board_id && errors.board_id.message}
          autoComplete="off"
        />
      </Box>
      <Stack direction="row" spacing={4} alignItems="center">
        <Typography
          component={InputLabel}
          htmlFor="isActive"
          gutterBottom
          color="inherit"
        >
          Is Active:
        </Typography>

        <Controller
          name="is_active"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="isActive"
              onChange={(e) => field.onChange(e.target.checked)}
              checked={field.value}
            />
          )}
        />
      </Stack>
      <Box
        sx={{
          position: "relative",
          marginTop: 2,
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-end",
        }}
      >
        <Button type="submit" disabled={isLoading}>
          Submit and Continue
        </Button>
        {isLoading && (
          <CircularProgress
            color="primary"
            size={30}
            thickness={5}
            sx={{
              position: "absolute",
              top: "50%",
              right: "25%",
              marginTop: "-12px",
              marginRight: "-12px",
            }}
          />
        )}
      </Box>
    </Box>
  );
}

export default AddIotDeviceForm;
