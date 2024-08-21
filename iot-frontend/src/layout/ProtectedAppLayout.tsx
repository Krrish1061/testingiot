import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import useRefreshToken from "../hooks/auth/useRefreshToken";
import useCompany from "../hooks/company/useCompany";
import useGetDealer from "../hooks/dealer/useGetDealer";
import useGetUser from "../hooks/users/useGetUser";
import useAuthStore from "../store/authStore";

function ProtectedAppLayout() {
  const {
    mutate,
    isLoading: isRefreshTokenLoading,
    isSuccess: isRefreshTokenSuccess,
    isIdle,
  } = useRefreshToken();
  const { isInitialLoading: isUserLoading, isSuccess: isFetchingUserSuccess } =
    useGetUser(isRefreshTokenSuccess);

  const isUserAssociatedWithCompany = useAuthStore(
    (state) => state.isUserAssociatedWithCompany
  );

  const { isInitialLoading: isDealerLoading } = useGetDealer();
  const { isInitialLoading: isCompanyLoading } = useCompany(
    isUserAssociatedWithCompany && isFetchingUserSuccess
  );

  useEffect(() => {
    if (!isRefreshTokenSuccess && isIdle) {
      mutate();
    }
  }, [isRefreshTokenSuccess, isIdle, mutate]);

  if (
    isRefreshTokenLoading ||
    isUserLoading ||
    isDealerLoading ||
    isCompanyLoading
  )
    return <LoadingSpinner size={40} />;

  return <Outlet />;
}

export default ProtectedAppLayout;
