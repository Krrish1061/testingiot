import { Navigate } from "react-router-dom";
import AdminDashboard from "../components/dashboard/AdminDashboard";
import SuperAdminDashboard from "../components/dashboard/SuperAdminDashboard";
import GroupNames from "../constants/groupNames";
import useAuthStore from "../store/authStore";

function Dashboard() {
  const user = useAuthStore((state) => state.user);
  if (!user) return <Navigate to="/login" />;

  if (user?.groups.includes(GroupNames.superAdminGroup)) {
    return <SuperAdminDashboard />;
  } else if (user?.groups.includes(GroupNames.adminGroup)) {
    return <AdminDashboard />;
  } else if (user?.groups.includes(GroupNames.moderatorGroup)) {
    return <div>create moderator Dashboard</div>;
  } else {
    return <div>create viewer Dashboard</div>;
  }
}

export default Dashboard;
