/* eslint-disable react-refresh/only-export-components */
import { RouteObject } from "react-router-dom";
import PrivateRoute from "../layout/PrivateRoute";
import UserGroups from "../constants/userGroups";
import { lazy } from "react";
import SuspenseFallback from "../components/SuspenseFallback";

const LazyRenderUserDashboard = lazy(
  () => import("../components/dashboard/RenderUserDashboard")
);
const LazyRenderCompanyDashboard = lazy(
  () => import("../components/dashboard/RenderCompanyDashboard")
);
const LazyManageIotDevices = lazy(() => import("../pages/ManageIotDevices"));
const LazyManageCompany = lazy(() => import("../pages/ManageCompany"));

const superAdminAndDealerRoutes: RouteObject[] = [
  {
    element: (
      <PrivateRoute
        hasPermission={[UserGroups.superAdminGroup, UserGroups.dealerGroup]}
      />
    ),
    children: [
      {
        path: "/user/:username",
        element: <SuspenseFallback children={<LazyRenderUserDashboard />} />,
      },
      {
        path: "/company/:companySlug",
        element: <SuspenseFallback children={<LazyRenderCompanyDashboard />} />,
      },
      {
        path: "/iot-devices",
        element: <SuspenseFallback children={<LazyManageIotDevices />} />,
      },
      {
        path: "/manage-companies",
        element: <SuspenseFallback children={<LazyManageCompany />} />,
      },
    ],
  },
];

export default superAdminAndDealerRoutes;
