import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import IsUserAuthenticated from "../components/IsUserAuthenticated";
import Dashboard from "../components/dashboard/Dashboard";
import RenderCompanyDashboard from "../components/dashboard/RenderCompanyDashboard";
import UserGroups from "../constants/userGroups";
import PrivateRoute from "../layout/PrivateRoute";
import ProtectedAppLayout from "../layout/ProtectedAppLayout";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import Index from "../pages/Index";
import LoginPage from "../pages/LoginPage";
import ManageCompany from "../pages/ManageCompany";
import ManageIotDevices from "../pages/ManageIotDevices";
import ManageSensors from "../pages/ManageSensors";
import ManageUser from "../pages/ManageUser";
import PasswordReset from "../pages/PasswordReset";
import SetUserPassword from "../pages/SetUserPassword";
import UpdateEmail from "../pages/UpdateEmail";
import VerifyEmail from "../pages/VerifyEmail";
import ViewCompanyProfile from "../pages/ViewCompanyProfile";
import ViewProfile from "../pages/ViewProfile";
import RenderUserDashboard from "../components/dashboard/RenderUserDashboard";
import SendLiveData from "../pages/SendLiveData";
import Error404Page from "../components/Error404Page";

// pages 404 unauthorized

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <Error404Page />,
    children: [
      {
        element: <ProtectedAppLayout />,
        children: [
          {
            element: <Dashboard />,
            children: [
              { index: true, element: <Index /> },
              {
                element: (
                  <PrivateRoute hasPermission={[UserGroups.superAdminGroup]} />
                ),
                children: [
                  { path: "/iot-devices", element: <ManageIotDevices /> },
                  { path: "/sensors", element: <ManageSensors /> },
                  {
                    path: "/company/:companySlug",
                    element: <RenderCompanyDashboard />,
                  },
                  {
                    path: "/user/:username",
                    element: <RenderUserDashboard />,
                  },
                  {
                    path: "/manage-companies",
                    element: <ManageCompany />,
                  },
                  {
                    path: "/send-liveData",
                    element: <SendLiveData />,
                  },
                ],
              },
              {
                path: "/manage-users",
                element: (
                  <PrivateRoute
                    hasPermission={[
                      UserGroups.superAdminGroup,
                      UserGroups.adminGroup,
                    ]}
                    children={<ManageUser />}
                  />
                ),
              },

              { path: "/profile", element: <ViewProfile /> },

              // for superadmin and company super admin
              {
                path: "/company-profile",
                element: <ViewCompanyProfile />,
              },
            ],
          },
          {
            element: <IsUserAuthenticated />,
            children: [{ path: "/login", element: <LoginPage /> }],
          },
        ],
      },
      { path: "/forget-password", element: <ForgotPasswordPage /> },
      { path: "/password-reset/:username/:token", element: <PasswordReset /> },
      { path: "/verify-email/:username/:token", element: <VerifyEmail /> },
      { path: "/change-email/:username/:token", element: <UpdateEmail /> },
      {
        path: "/set-user-password/:username/:token",
        element: <SetUserPassword />,
      },
    ],
  },
]);

export default router;
