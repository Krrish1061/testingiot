import DownloadIcon from "@mui/icons-material/Download";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import useAuthStore from "../../store/authStore";
import UserGroups from "../../constants/userGroups";

function IndexHeader() {
  const user = useAuthStore((state) => state.user);
  const isDownloadPermissible =
    user &&
    user.groups.some(
      (group) =>
        group === UserGroups.superAdminGroup || group === UserGroups.adminGroup
    );

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      marginBottom={2}
      spacing={2}
    >
      <Typography variant="h6" component="h1">
        DASHBOARD
      </Typography>
      {isDownloadPermissible && (
        <Button
          variant="contained"
          size="medium"
          startIcon={<DownloadIcon />}
          color="secondary"
        >
          <Typography noWrap>DOWNLOAD DATA</Typography>
        </Button>
      )}
    </Stack>
  );
}

export default IndexHeader;
