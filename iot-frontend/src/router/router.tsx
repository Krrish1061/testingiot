import { createBrowserRouter } from "react-router-dom";
import IsUserAuthenticated from "../components/IsUserAuthenticated";
import ProtectedAppLayout from "../layout/ProtectedAppLayout";
import Dashboard from "../pages/Dashboard";
import LoginPage from "../pages/LoginPage";
import Index from "../components/dashboard/Index";
import ManageUser from "../pages/ManageUser";

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
