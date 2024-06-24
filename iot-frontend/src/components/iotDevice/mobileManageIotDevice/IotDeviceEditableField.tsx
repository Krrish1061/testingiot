import Autocomplete from "@mui/material/Autocomplete";
import Checkbox from "@mui/material/Checkbox";
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
import UserGroups from "../../../constants/userGroups";
import Company from "../../../entities/Company";
import IotDevice from "../../../entities/IotDevice";
import User from "../../../entities/User";
import { IDeviceFormInputs } from "../zodSchema/IotDeviceSchema";

interface Props {
  isEditMode: boolean;
  iotDevice: IotDevice;
  isUserSuperAdmin: boolean;
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
  isUserSuperAdmin,
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
      <Stack
        direction="row"
        spacing={2}
        marginY={2}
        paddingLeft={{ xs: 2, sm: 5 }}
        alignItems="center"
      >
        <Typography
          component={isEditMode ? InputLabel : "div"}
          htmlFor={userId}
          sx={{
            color: "inherit",
            marginRight: isEditMode ? 3 : 0,
            overflow: "visible",
          }}
        >
          User:
        </Typography>
        {!isEditMode ? (
          <Typography>{userName}</Typography>
        ) : (
          <Controller
            name="user"
            control={control}
            render={({ field }) => (
              <Autocomplete
                {...field}
                fullWidth
                id={userId}
                options={
                  userList?.filter(
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
                  userList?.find((item) => field.value === item.username) ||
                  null
                }
                sx={{ minWidth: 180, maxWidth: 300 }}
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

      <Stack
        direction="row"
        spacing={2}
        marginY={2}
        paddingLeft={{ xs: 2, sm: 5 }}
        alignItems="center"
      >
        <Typography
          component={isEditMode ? InputLabel : "div"}
          htmlFor={companyId}
          sx={{
            color: "inherit",
            marginRight: isEditMode ? -1 : 0,
            overflow: "visible",
          }}
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
                fullWidth
                id={companyId}
                options={companyList ?? []}
                getOptionLabel={(option) => option.name}
                value={
                  companyList?.find((item) => field.value === item.slug) || null
                }
                sx={{ maxWidth: 300, minWidth: 180 }}
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

      {isUserSuperAdmin && (
        <>
          <Stack
            direction="row"
            spacing={2}
            marginBottom={2}
            paddingLeft={{ xs: 2, sm: 5 }}
            alignItems="center"
          >
            <Typography
              component={isEditMode ? InputLabel : "div"}
              htmlFor={boardId}
              gutterBottom
              color="inherit"
              sx={{ overflow: "visible" }}
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
                fullWidth
                error={!!errors.board_id}
                helperText={errors.board_id && errors.board_id.message}
                autoComplete="off"
                sx={{ maxWidth: 300 }}
              />
            )}
          </Stack>
          <Stack
            direction="row"
            spacing={4}
            alignItems="center"
            paddingLeft={{ xs: 2, sm: 5 }}
          >
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
                  onChange={(e) =>
                    isEditMode && field.onChange(e.target.checked)
                  }
                  checked={field.value}
                />
              )}
            />
          </Stack>
        </>
      )}
    </>
  );
}

export default IotDeviceEditableField;
