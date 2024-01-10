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
import CompanyIndex from "../components/CompanyIndex";
import App from "../App";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import VerifyEmail from "../pages/VerifyEmail";
import SetUserPassword from "../pages/SetUserPassword";
import PasswordReset from "../pages/PasswordReset";
import ViewProfile from "../pages/ViewProfile";
import UpdateEmail from "../pages/UpdateEmail";
import PrivateRoute from "../layout/PrivateRoute";
import UserGroups from "../constants/userGroups";
import ViewCompanyProfile from "../pages/ViewCompanyProfile";
import MobileManageUsers from "../components/user/mobileUserTable/MobileManageUsers";
import ManageCompany from "../pages/ManageCompany";

// pages 404 unauthorized

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
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
              {
                path: "/manage-companies",
                element: (
                  <PrivateRoute
                    hasPermission={[UserGroups.superAdminGroup]}
                    children={<ManageCompany />}
                  />
                ),
              },
              { path: "/profile", element: <ViewProfile /> },
              { path: "/company", element: <CompanyIndex /> },
              // for superadmin and company super admin
              {
                path: "/company-profile",
                element: <ViewCompanyProfile />,
              },
              { path: "/test", element: <Test /> },
              { path: "/test1", element: <MobileManageUsers /> },
            ],
          },
          {
            element: <IsUserAuthenticated />,
            children: [
              { path: "/login", element: <LoginPage /> },
              { path: "/aforget-password", element: <ForgotPasswordPage /> },
            ],
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
