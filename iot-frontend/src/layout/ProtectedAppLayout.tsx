import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import useRefreshToken from "../hooks/auth/useRefreshToken";
import LoadingSpinner from "../components/LoadingSpinner";
import useGetUser from "../hooks/users/useGetUser";

function ProtectedAppLayout() {
  const location = useLocation();
  const {
    mutate,
    isSuccess: isRefreshTokenSuccess,
    isIdle,
    isError: isRefreshTokenError,
  } = useRefreshToken();
  const { isLoading } = useGetUser(isRefreshTokenSuccess);

  useEffect(() => {
    if (!isRefreshTokenSuccess && isIdle && location.state?.from !== "logout") {
      mutate();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRefreshTokenSuccess, isIdle, mutate, location]);

  if (location.state?.from === "logout") return <Outlet />;

  if (isRefreshTokenError) return <Outlet />;

  if (isLoading) return <LoadingSpinner size={80} thickness={4} />;

  return <Outlet />;

  // if (isSuccess) {
  //   return <Outlet />;
  // } else if (isError) {
  //   return <Outlet />;
  // } else {
  //   return <LoadingSpinner />;
  // }
}

export default ProtectedAppLayout;
