import { Navigate } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import SuperAdminDashboard from "./SuperAdminDashboard";
import UserGroups from "../../constants/userGroups";
import useAuthStore from "../../store/authStore";
import { useEffect } from "react";
import useWebSocketStore from "../../store/webSocketStore";
import useGetUser from "../../hooks/useGetUser";
import LoadingSpinner from "../LoadingSpinner";

function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const { isLoading } = useGetUser();
  const closeWebSocket = useWebSocketStore((state) => state.closeWebSocket);
  useEffect(() => {
    return () => {
      // Close WebSocket when component unmounts
      closeWebSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!user) return <Navigate to="/login" />;
  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (user?.groups.includes(UserGroups.superAdminGroup)) {
    return <SuperAdminDashboard />;
  } else if (user?.groups.includes(UserGroups.adminGroup)) {
    return <AdminDashboard />;
  } else if (user?.groups.includes(UserGroups.moderatorGroup)) {
    return <div>create moderator Dashboard</div>;
  } else {
    return <div>create viewer Dashboard</div>;
  }
}

export default Dashboard;
