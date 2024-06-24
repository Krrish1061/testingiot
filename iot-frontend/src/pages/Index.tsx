import DealerUserDashboard from "../components/dashboard/DealerUserDashboard";
import SuperAdminDashboard from "../components/dashboard/SuperAdminDashboard";
import LineGraphContainer from "../components/graph/LineGraphContainer";
import IndexHeader from "../components/index/IndexHeader";
import LiveDataCardContainer from "../components/liveData/LiveDataCardContainer";
import useAuthStore from "../store/authStore";

function Index() {
  const isUserSuperAdmin = useAuthStore((state) => state.isUserSuperAdmin);
  const isUserDealer = useAuthStore((state) => state.isUserDealer);

  return (
    <>
      <IndexHeader />
      {isUserSuperAdmin && <SuperAdminDashboard />}
      {isUserDealer && <DealerUserDashboard />}
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
