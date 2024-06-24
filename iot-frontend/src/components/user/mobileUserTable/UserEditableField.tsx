import Checkbox from "@mui/material/Checkbox";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Control, Controller } from "react-hook-form";
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

const getUserTypeOptions = (
  isUserDealer: boolean,
  isUserCompanySuperAdmin: boolean,
  isUserSuperAdmin: boolean
) => {
  if (isUserDealer) {
    return [
      {
        value: UserTypes.admin,
        label: UserTypes.admin,
      },
    ];
  }

  const options = [
    { value: UserTypes.moderator, label: UserTypes.moderator },
    { value: UserTypes.viewer, label: UserTypes.viewer },
  ];

  // if user are in company super admin or SuperAdmin add admin options
  if (isUserSuperAdmin || isUserCompanySuperAdmin) {
    options.push({
      value: UserTypes.admin,
      label: UserTypes.admin,
    });
  }

  return options;
};

function UserEditableField({ isEditMode, userType, username, control }: Props) {
  const isUserSuperAdmin = useAuthStore((state) => state.isUserSuperAdmin);
  const isUserCompanySuperAdmin = useAuthStore(
    (state) => state.isUserCompanySuperAdmin
  );
  const isUserDealer = useAuthStore((state) => state.isUserDealer);
  const userTypeId = `user-type-${username}`;
  const userIsActiveId = `user-isactive-${username}`;

  const userTypeOptions = getUserTypeOptions(
    isUserDealer,
    isUserCompanySuperAdmin,
    isUserSuperAdmin
  );

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
                {userTypeOptions.map((option, index) => (
                  <MenuItem key={index} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
        )}
      </Stack>
      {isUserSuperAdmin && (
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
      )}
    </>
  );
}

export default UserEditableField;
