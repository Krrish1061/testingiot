import Checkbox from "@mui/material/Checkbox";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Control, Controller } from "react-hook-form";
import UserGroups from "../../../constants/userGroups";
import UserTypes from "../../../constants/userTypes";
import useAuthStore from "../../../store/authStore";

interface IFormInputs {
  type: "ADMIN" | "MODERATOR" | "VIEWER" | "SUPERADMIN";
  is_active: boolean;
}

interface Props {
  isEditMode: boolean;
  userType: string;
  username: string;
  control: Control<IFormInputs>;
}

function UserEditableField({ isEditMode, userType, username, control }: Props) {
  const user = useAuthStore((state) => state.user);
  const isUserSuperAdmin =
    user?.groups.includes(UserGroups.superAdminGroup) || false;
  const isUserCompanySuperAdmin =
    user?.groups.includes(UserGroups.companySuperAdminGroup) || false;
  const userTypeId = `user-type-${username}`;
  const userIsActiveId = `user-isactive-${username}`;

  return (
    <>
      <Stack
        marginTop={1}
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        spacing={2}
        paddingLeft={5}
      >
        <Typography
          component={isEditMode ? InputLabel : "div"}
          htmlFor={userTypeId}
          sx={{ color: "inherit" }}
        >
          User Type:
        </Typography>
        {!isEditMode ? (
          <Typography>{userType} </Typography>
        ) : (
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                value={field.value}
                inputProps={{
                  id: userTypeId,
                }}
              >
                <MenuItem value={UserTypes.viewer}>VIEWER</MenuItem>
                <MenuItem value={UserTypes.moderator}>MODERATOR</MenuItem>
                {(isUserCompanySuperAdmin || isUserSuperAdmin) && (
                  <MenuItem value={UserTypes.admin}>ADMIN</MenuItem>
                )}
              </Select>
            )}
          />
        )}
      </Stack>
      <Stack
        marginBottom={2}
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        spacing={2}
        paddingLeft={5}
      >
        <InputLabel htmlFor={userIsActiveId} sx={{ color: "inherit" }}>
          Is Active:
        </InputLabel>
        <Controller
          name="is_active"
          control={control}
          render={({ field }) => (
            <Checkbox
              id={userIsActiveId}
              size="small"
              onChange={(e) => {
                if (!e.target.readOnly) field.onChange(e.target.checked);
              }}
              checked={field.value}
              inputProps={{
                readOnly: isEditMode ? false : true,
              }}
            />
          )}
        />
      </Stack>
    </>
  );
}

export default UserEditableField;
