import { createBrowserRouter } from "react-router-dom";
import IsUserAuthenticated from "../components/IsUserAuthenticated";
import ProtectedAppLayout from "../layout/ProtectedAppLayout";
import Dashboard from "../components/dashboard/Dashboard";
import LoginPage from "../pages/LoginPage";
import Index from "../pages/Index";
import ManageUser from "../pages/ManageUser";
import Test from "../components/Test";
import ManageIotDevices from "../pages/ManageIotDevices";
import ManageSensors from "../pages/ManageSensors";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedAppLayout />,
    children: [
      {
        element: <Dashboard />,
        children: [
          { index: true, element: <Index /> },
          { path: "/manage-users", element: <ManageUser /> },
          { path: "/iot-devices", element: <ManageIotDevices /> },
          { path: "/sensors", element: <ManageSensors /> },
          { path: "/test", element: <Test /> },
        ],
      },

      {
        element: <IsUserAuthenticated />,
        children: [{ path: "/login", element: <LoginPage /> }],
      },
    ],
  },
]);

export default router;
