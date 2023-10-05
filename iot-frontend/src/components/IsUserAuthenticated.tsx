import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore";

function IsUserAuthenticated() {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const redirectUrl = location.state?.from || "/";
  return user ? <Navigate to={redirectUrl} replace={true} /> : <Outlet />;
}

export default IsUserAuthenticated;
