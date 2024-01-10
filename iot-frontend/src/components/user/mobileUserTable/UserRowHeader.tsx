import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import useAuthStore from "../../../store/authStore";
import UserGroups from "../../../constants/userGroups";

interface Props {
  fullName: string;
  email?: string;
  company?: string | null;
}

function UserRowHeader({ fullName, email, company }: Props) {
  const user = useAuthStore((state) => state.user);
  const isUserSuperAdmin =
    user?.groups.includes(UserGroups.superAdminGroup) || false;
  return (
    <Box>
      <Typography variant="h6" component="div" marginBottom={0}>
        {fullName}
      </Typography>
      {!isUserSuperAdmin && (
        <Typography paddingLeft={1} variant="body1" fontSize={14}>
          {company}
        </Typography>
      )}
      <Typography paddingLeft={1} variant="body1" fontSize={14}>
        {email}
      </Typography>
    </Box>
  );
}

export default UserRowHeader;
