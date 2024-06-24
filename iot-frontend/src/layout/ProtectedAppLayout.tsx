import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import useRefreshToken from "../hooks/auth/useRefreshToken";
import useCompany from "../hooks/company/useCompany";
import useGetDealer from "../hooks/dealer/useGetDealer";
import useGetUser from "../hooks/users/useGetUser";
import useAuthStore from "../store/authStore";

function ProtectedAppLayout() {
  const location = useLocation();
  const {
    mutate,
    isSuccess: isRefreshTokenSuccess,
    isIdle,
    isError: isRefreshTokenError,
  } = useRefreshToken();
  const { isLoading, isSuccess: isFetchingUserSuccess } = useGetUser(
    isRefreshTokenSuccess
  );
  const isUserCompanySuperAdmin = useAuthStore(
    (state) => state.isUserCompanySuperAdmin
  );

  const { isInitialLoading: isDealerLoading } = useGetDealer();
  const { isInitialLoading: isCompanyLoading } = useCompany(
    isUserCompanySuperAdmin && isFetchingUserSuccess
  );

  useEffect(() => {
    if (!isRefreshTokenSuccess && isIdle && location.state?.from !== "logout") {
      mutate();
    }
  }, [isRefreshTokenSuccess, isIdle, mutate, location]);

  if (location.state?.from === "logout") return <Outlet />;

  if (isRefreshTokenError) return <Outlet />;

  if (isLoading || isDealerLoading || isCompanyLoading)
    return <LoadingSpinner size={80} thickness={4} />;

  return <Outlet />;
}

export default ProtectedAppLayout;
