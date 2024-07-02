import { lazy } from "react";
import SuspenseFallback from "../components/SuspenseFallback";
import LineGraphContainer from "../components/graph/LineGraphContainer";
import IndexHeader from "../components/index/IndexHeader";
import LiveDataCardContainer from "../components/liveData/LiveDataCardContainer";
import useAuthStore from "../store/authStore";

const LazySuperAdminDashboard = lazy(
  () => import("../components/dashboard/SuperAdminDashboard")
);
const LazyDealerUserDashboard = lazy(
  () => import("../components/dashboard/DealerUserDashboard")
);

function Index() {
  const isUserSuperAdmin = useAuthStore((state) => state.isUserSuperAdmin);
  const isUserDealer = useAuthStore((state) => state.isUserDealer);

  return (
    <>
      <IndexHeader />
      {isUserSuperAdmin && (
        <SuspenseFallback children={<LazySuperAdminDashboard />} />
      )}
      {isUserDealer && (
        <SuspenseFallback children={<LazyDealerUserDashboard />} />
      )}
      {!isUserSuperAdmin && !isUserDealer && (
        <>
          <LiveDataCardContainer />
          <LineGraphContainer />
        </>
      )}
    </>
  );
}

export default Index;
