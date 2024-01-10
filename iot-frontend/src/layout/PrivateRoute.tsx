// import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import useAuthStore from "../store/authStore";
import { Outlet } from "react-router-dom";

interface Props {
  children?: ReactNode;
  hasPermission: string[];
}

function PrivateRoute({ hasPermission, children }: Props) {
  const user = useAuthStore((state) => state.user);

  if (user && !user.groups.some((v) => hasPermission.indexOf(v) !== -1)) {
    return <div>forbidden</div>;
  }

  if (children) {
    return children;
  }

  return <Outlet />;
}

export default PrivateRoute;
