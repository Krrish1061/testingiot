import { createBrowserRouter } from "react-router-dom";
import IsUserAuthenticated from "../components/IsUserAuthenticated";
import ProtectedAppLayout from "../layout/ProtectedAppLayout";
import Dashboard from "../pages/Dashboard";
import LoginPage from "../pages/LoginPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedAppLayout />,
    children: [
      { index: true, element: <Dashboard /> },

      {
        element: <IsUserAuthenticated />,
        children: [{ path: "/login", element: <LoginPage /> }],
      },
    ],
  },
]);

export default router;
