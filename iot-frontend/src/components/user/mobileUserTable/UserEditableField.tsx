import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import UserTypes from "../../../constants/userTypes";
import Checkbox from "@mui/material/Checkbox";
import { ChangeEvent } from "react";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import UserGroups from "../../../constants/userGroups";
import useAuthStore from "../../../store/authStore";

interface Props {
  isEditMode: boolean;
  userType: string;
  username: string;
  type: string;
  isActive: boolean;
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleTypeChange: (event: SelectChangeEvent) => void;
}

function UserEditableField({
  isEditMode,
  userType,
  username,
  type,
  isActive,
  handleChange,
  handleTypeChange,
}: Props) {
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
        marginTop={2}
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
          <FormControl
            variant="outlined"
            size="small"
            sx={{ marginTop: 1, minWidth: 150 }}
          >
            <Select
              value={type}
              inputProps={{
                id: userTypeId,
              }}
              onChange={handleTypeChange}
            >
              <MenuItem value={UserTypes.viewer}>VIEWER</MenuItem>
              <MenuItem value={UserTypes.moderator}>MODERATOR</MenuItem>
              {(isUserCompanySuperAdmin || isUserSuperAdmin) && (
                <MenuItem value={UserTypes.admin}>ADMIN</MenuItem>
              )}
            </Select>
          </FormControl>
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
        <Checkbox
          id={userIsActiveId}
          size="small"
          checked={isActive}
          onChange={handleChange}
          inputProps={{
            readOnly: !isEditMode ? true : false,
          }}
        />
      </Stack>
    </>
  );
}

export default UserEditableField;
