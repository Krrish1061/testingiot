import Typography from "@mui/material/Typography";
import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import useAuthStore from "../store/authStore";

interface Props {
  children?: ReactNode;
  hasPermission: string[];
}

function PrivateRoute({ hasPermission, children }: Props) {
  const user = useAuthStore((state) => state.user);

  if (user && !user.groups.some((v) => hasPermission.indexOf(v) !== -1)) {
    return (
      <Typography color="error.main">
        You Don't Have permission to view this page
      </Typography>
    );
  }

  if (children) {
    return children;
  }

  return <Outlet />;
}

export default PrivateRoute;
