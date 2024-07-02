/* eslint-disable react-refresh/only-export-components */
import { RouteObject } from "react-router-dom";
import PrivateRoute from "../layout/PrivateRoute";
import UserGroups from "../constants/userGroups";
import { lazy } from "react";
import SuspenseFallback from "../components/SuspenseFallback";

const LazyManageUser = lazy(() => import("../pages/ManageUser"));

const superAdminAndAdminRoutes: RouteObject[] = [
  {
    path: "/manage-users",
    element: (
      <PrivateRoute
        hasPermission={[UserGroups.superAdminGroup, UserGroups.adminGroup]}
        children={<SuspenseFallback children={<LazyManageUser />} />}
      />
    ),
  },
];

export default superAdminAndAdminRoutes;
