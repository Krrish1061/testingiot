import DownloadIcon from "@mui/icons-material/Download";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import useAuthStore from "../../store/authStore";
import UserGroups from "../../constants/userGroups";
import { useRef, useState } from "react";
import DownloadForm from "./DownloadForm";

function IndexHeader() {
  const user = useAuthStore((state) => state.user);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const isDownloadPermissible =
    user &&
    user.groups.some(
      (group) =>
        group === UserGroups.superAdminGroup ||
        group === UserGroups.adminGroup ||
        group === UserGroups.moderatorGroup
    );
  const handleDownloadClick = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  return (
    <>
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
            ref={anchorRef}
            color="secondary"
            onClick={handleDownloadClick}
          >
            DOWNLOAD DATA
          </Button>
        )}
      </Stack>
      <DownloadForm open={open} setOpen={setOpen} anchorRef={anchorRef} />
    </>
  );
}

export default IndexHeader;
