import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import useRefreshToken from "../hooks/auth/useRefreshToken";
import LoadingSpinner from "../components/LoadingSpinner";
import useGetUser from "../hooks/users/useGetUser";

function ProtectedAppLayout() {
  const {
    mutate,
    isSuccess: isRefreshTokenSuccess,
    isIdle,
    isError: isRefreshTokenError,
  } = useRefreshToken();
  const { isLoading } = useGetUser(isRefreshTokenSuccess);

  useEffect(() => {
    if (!isRefreshTokenSuccess && isIdle) {
      mutate();
    }
  }, [isRefreshTokenSuccess, isIdle, mutate]);

  if (isRefreshTokenError) return <Outlet />;

  if (isLoading) return <LoadingSpinner />;

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
