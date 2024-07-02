/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react";
import { RouteObject } from "react-router-dom";
import SuspenseFallback from "../components/SuspenseFallback";
import UserGroups from "../constants/userGroups";
import PrivateRoute from "../layout/PrivateRoute";

const LazyViewCompanyProfile = lazy(
  () => import("../pages/ViewCompanyProfile")
);

const companySuperAdminRoutes: RouteObject[] = [
  {
    path: "/company-profile",
    element: (
      <PrivateRoute
        hasPermission={[UserGroups.companySuperAdminGroup]}
        children={<SuspenseFallback children={<LazyViewCompanyProfile />} />}
      />
    ),
  },
];

export default companySuperAdminRoutes;
