import AdminDashboard from "./AdminDashboard";
import SuperAdminDashboard from "./SuperAdminDashboard";
import UserGroups from "../../constants/userGroups";
import useAuthStore from "../../store/authStore";
import { useEffect } from "react";
import useWebSocketStore from "../../store/webSocketStore";
import ViewerDashboard from "./ViewerDashboard";
import ModeratorDashboard from "./ModeratorDashboard";

function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const closeWebSocket = useWebSocketStore((state) => state.closeWebSocket);
  useEffect(() => {
    return () => {
      // Close WebSocket when component unmounts
      closeWebSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (user?.groups.includes(UserGroups.superAdminGroup)) {
    return <SuperAdminDashboard />;
  } else if (user?.groups.includes(UserGroups.adminGroup)) {
    return <AdminDashboard />;
  } else if (user?.groups.includes(UserGroups.moderatorGroup)) {
    // set is drawer open to false or ...
    return <ModeratorDashboard />;
  } else {
    // set is drawer open to false
    return <ViewerDashboard />;
  }
}

export default Dashboard;
