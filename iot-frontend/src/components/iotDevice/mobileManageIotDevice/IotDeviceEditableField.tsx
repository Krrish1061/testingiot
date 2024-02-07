import Autocomplete from "@mui/material/Autocomplete";
import InputLabel from "@mui/material/InputLabel";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
  Control,
  Controller,
  FieldErrors,
  UseFormRegister,
} from "react-hook-form";
import { IDeviceFormInputs } from "../zodSchema/IotDeviceSchema";
import Checkbox from "@mui/material/Checkbox";
import UserGroups from "../../../constants/userGroups";
import Company from "../../../entities/Company";
import IotDevice from "../../../entities/IotDevice";
import User from "../../../entities/User";

interface Props {
  isEditMode: boolean;
  iotDevice: IotDevice;
  control: Control<IDeviceFormInputs>;
  errors: FieldErrors<IDeviceFormInputs>;
  userList: User[] | undefined;
  companyList: Company[] | undefined;
  companyName: string | undefined;
  userName: string | undefined | null;
  register: UseFormRegister<IDeviceFormInputs>;
}

function IotDeviceEditableField({
  isEditMode,
  iotDevice,
  control,
  errors,
  userList,
  companyList,
  companyName,
  userName,
  register,
}: Props) {
  const userId = iotDevice?.user + "-" + iotDevice.id;
  const companyId = iotDevice?.company + "-" + iotDevice.id;
  const boardId = "board-id-" + iotDevice.id;
  const isActive = "is-Active-" + iotDevice.id;

  return (
    <>
      <Stack direction="row" spacing={4} marginY={2} paddingLeft={5}>
        <Typography
          component={isEditMode ? InputLabel : "div"}
          htmlFor={userId}
          sx={{ color: "inherit", marginRight: 3.5 }}
        >
          User:
        </Typography>
        {!isEditMode ? (
          <Typography>{userName} </Typography>
        ) : (
          <Controller
            name="user"
            control={control}
            render={({ field }) => (
              <Autocomplete
                {...field}
                disablePortal
                id={userId}
                options={
                  userList?.filter(
                    (user) =>
                      user.groups.includes(UserGroups.adminGroup) &&
                      !user.is_associated_with_company
                  ) ?? []
                }
                getOptionLabel={(option) =>
                  `${option.profile?.first_name} ${option.profile?.last_name}`
                }
                value={
                  userList?.find((item) => field.value === item.username) ||
                  null
                }
                sx={{ width: 300 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    type="text"
                    error={!!errors.user}
                    helperText={errors.user?.message}
                  />
                )}
                onChange={(_, data) => field.onChange(data?.username || null)}
              />
            )}
          />
        )}
      </Stack>

      <Stack direction="row" spacing={4} marginY={2} paddingLeft={5}>
        <Typography
          component={isEditMode ? InputLabel : "div"}
          htmlFor={companyId}
          sx={{ color: "inherit", marginRight: -1 }}
        >
          Company:
        </Typography>

        {!isEditMode ? (
          <Typography>{companyName}</Typography>
        ) : (
          <Controller
            name="company"
            control={control}
            render={({ field }) => (
              <Autocomplete
                {...field}
                disablePortal
                id={companyId}
                options={companyList ?? []}
                getOptionLabel={(option) => option.name}
                value={
                  companyList?.find((item) => field.value === item.slug) || null
                }
                sx={{ width: 300 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    type="text"
                    error={!!errors.company}
                    helperText={errors.company?.message}
                  />
                )}
                onChange={(_, data) => {
                  field.onChange(data?.slug || null);
                }}
              />
            )}
          />
        )}
      </Stack>

      <Stack direction="row" spacing={4} marginBottom={2} paddingLeft={5}>
        <Typography
          component={isEditMode ? InputLabel : "div"}
          htmlFor={boardId}
          gutterBottom
          color="inherit"
        >
          Board Id:
        </Typography>
        {!isEditMode ? (
          <Typography>{iotDevice.board_id} </Typography>
        ) : (
          <TextField
            inputProps={{
              ...register("board_id"),
            }}
            id={boardId}
            type="number"
            error={!!errors.board_id}
            helperText={errors.board_id && errors.board_id.message}
            autoComplete="off"
          />
        )}
      </Stack>
      <Stack direction="row" spacing={4} alignItems="center" paddingLeft={5}>
        <Typography
          component={isEditMode ? InputLabel : "div"}
          htmlFor={isActive}
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
              id={isActive}
              onChange={(e) => isEditMode && field.onChange(e.target.checked)}
              checked={field.value}
            />
          )}
        />
      </Stack>
    </>
  );
}

export default IotDeviceEditableField;
