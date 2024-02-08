import useAuthStore from "../store/authStore";
import UserGroups from "../constants/userGroups";
import IndexHeader from "../components/index/IndexHeader";
import LiveDataCardContainer from "../components/liveData/LiveDataCardContainer";
import SuperAdminDashboard from "../components/dashboard/SuperAdminDashboard";

function Index() {
  const user = useAuthStore((state) => state.user);
  const isSuperAdminUser =
    user && user.groups.includes(UserGroups.superAdminGroup);

  return (
    <>
      <IndexHeader />
      {isSuperAdminUser ? <SuperAdminDashboard /> : <LiveDataCardContainer />}
    </>
  );
}

export default Index;
