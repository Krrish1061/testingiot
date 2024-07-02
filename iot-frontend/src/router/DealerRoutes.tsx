/* eslint-disable react-refresh/only-export-components */
import { RouteObject } from "react-router-dom";
import UserGroups from "../constants/userGroups";
import PrivateRoute from "../layout/PrivateRoute";
import { lazy } from "react";
import SuspenseFallback from "../components/SuspenseFallback";

const LazyViewDealerProfile = lazy(() => import("../pages/ViewDealerProfile"));

const dealerRoutes: RouteObject[] = [
  {
    path: "/dealer-profile",
    element: (
      <PrivateRoute
        hasPermission={[UserGroups.dealerGroup]}
        children={<SuspenseFallback children={<LazyViewDealerProfile />} />}
      />
    ),
  },
];

export default dealerRoutes;
